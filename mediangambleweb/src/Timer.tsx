import { Devvit, useInterval, useState, RedisClient, Context } from '@devvit/public-api';

const Timer = ({ redis, postId, context, setWebviewVisible }: { 
  redis: RedisClient; 
  postId: string; 
  context: Context;
  setWebviewVisible: (page: string) => void; 
}) => {
  const key = (postId: string | undefined): string => {
    return `timer_state:${postId}`;
  };

  const [endTime, setEndTime] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number>(300);

  // Debug function to force timer end
  const forceEndTimer = async () => {
    const currentTime = Date.now();
    await redis.set(key(postId), String(currentTime)); // Set endTime to current time
    setEndTime(currentTime);
    setSeconds(0);
  };

  // Sync with Redis occasionally (for global state)
  const syncTimer = useInterval(async () => {
    try {
      let storedEndTime = await redis.get(key(postId));
      
      if (!storedEndTime) {
        const newEndTime = Date.now() + (24 * 60 * 60 * 1000);
        await redis.set(key(postId), String(newEndTime));
        storedEndTime = String(newEndTime);
      }

      const parsedEndTime = Number(storedEndTime);
      setEndTime(parsedEndTime);
    } catch (error) {
      console.error('Error syncing with Redis:', error);
    }
  }, 5000);

  // Smooth local countdown (for display)
  const localTimer = useInterval(() => {
    if (!endTime) return;
    
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    setSeconds(remaining);

    if (remaining <= 0) {
      localTimer.stop();
      syncTimer.stop();
      setWebviewVisible('conclusion');
      context.ui.webView.postMessage('medianGame', {
        type: 'endGame'
      });
      return;
    }
  }, 100);

  syncTimer.start();
  localTimer.start();

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <vstack gap="medium" alignment="center middle">
      <text size="xxlarge" weight="bold" color="white">
        {endTime === null ? "Calculating Time Left..." : `Time Left: ${formatTime(seconds)}`}
      </text>
      <button 
        onPress={forceEndTimer}
        appearance="secondary"
        textColor="white"
      >
        End Timer Now (Debug)
      </button>
    </vstack>
  );
};

export { Timer }; 
