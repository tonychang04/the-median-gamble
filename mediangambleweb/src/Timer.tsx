import { Devvit, useInterval, useState, RedisClient, Context } from '@devvit/public-api';
import { calculateGameResults } from './calculateGame.js';

const Timer = ({ redis, postId, context, setWebviewVisible }: { 
  redis: RedisClient; 
  postId: string; 
  context: Context;
  setWebviewVisible: (page: string) => void; 
}) => {
  const key = (postId: string | undefined): string => {
    return `timer_state:${postId}`;
  };

  // Only track endTime
  const [endTime, setEndTime] = useState<number | null>(async () => {
    try {
      let storedEndTime = await redis.get(key(postId));
      
      if (!storedEndTime) {
        const newEndTime = Date.now() + (24 * 60 * 60 * 1000);
        await redis.set(key(postId), String(newEndTime));
        return newEndTime;
      }
      
      return Number(storedEndTime);
    } catch (error) {
      console.error('Error loading initial time:', error);
      return null;
    }
  });

  const forceEndTimer = async () => {
    const currentTime = Date.now();
    await redis.set(key(postId), String(currentTime));
    setEndTime(currentTime);
  };

  // Sync with Redis occasionally
  const syncTimer = useInterval(async () => {
    try {
      let storedEndTime = await redis.get(key(postId));
      if (storedEndTime) {
        setEndTime(Number(storedEndTime));
      }
    } catch (error) {
     // console.error('Error syncing with Redis:', error);
    }
  }, 10000);

  // Add state to track if conclusion was shown
  const [conclusionShown, setConclusionShown] = useState(false);

  // Local display update
  const localTimer = useInterval(async () => {
    if (!endTime) return;
    
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

    if (remaining <= 0) {
      localTimer.stop();
      syncTimer.stop();
      
      try {
        if (!conclusionShown) {  // Only show conclusion once
          const username = (await context.reddit.getCurrentUser())?.username ?? 'anon';
          const results = await calculateGameResults(redis, postId, username);
          setWebviewVisible('conclusion');
          setConclusionShown(true);
          
          context.ui.webView.postMessage('medianGame', {
            type: 'gameResults',
            data: results
          });
        }
      } catch (error) {
        console.error('Error calculating end game results:', error);
      }
    }
  }, 100);

  syncTimer.start();
  localTimer.start();

  const formatTime = (endTimeMs: number | null) => {
    if (!endTimeMs) return "00:00:00";
    const remaining = Math.max(0, Math.floor((endTimeMs - Date.now()) / 1000));
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <vstack gap="medium" alignment="center middle">
      <text size="xxlarge" weight="bold" color="white">
        {endTime === null ? "Calculating Time Left..." : 
         (endTime - Date.now() <= 0) ? "Game Ended! 🏆 Results below!" : 
         `Time Left: ${formatTime(endTime)}`}
      </text>
      {/* Debug button commented out
      <button 
        onPress={forceEndTimer}
        appearance="secondary"
        textColor="white"
      >
        End Timer Now (Debug)
      </button>
      */}
    </vstack>
  );
};

export { Timer }; 
