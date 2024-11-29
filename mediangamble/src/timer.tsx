import { Devvit, useInterval, useState } from '@devvit/public-api';

const Timer: Devvit.CustomPostComponent = ({redis, postId }) => {
  const key = (postId: string | undefined): string => {
    return `timer_state:${postId}`;
  };

  const [seconds, setSeconds] = useState(async () => {
    const endTime = await redis.get(key(postId));
    if (!endTime) return 24 * 3600;
    const remaining = Math.max(0, Math.floor((Number(endTime) - Date.now()) / 1000));
    return remaining;
  });

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timer = useInterval(async () => {
    if (seconds > 0) {
      setSeconds(prev => prev - 1);
      await redis.set(key(postId), String(Date.now() + seconds * 1000));
    }
  }, 1000);

  return (
    <vstack gap="medium" alignment="center middle">
      <text size="xxlarge" weight="bold">{formatTime(seconds)}</text>
      
      <hstack gap="medium">
        <button
          onPress={async () => {
            timer.stop();
            setSeconds(24 * 3600);
            await redis.del(key(postId));
          }}
        >
          Reset
        </button>
      </hstack>
    </vstack>
  );
};

export { Timer }
