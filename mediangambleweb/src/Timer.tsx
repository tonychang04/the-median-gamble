import { Devvit, useInterval, useState } from '@devvit/public-api';

const Timer: Devvit.CustomPostComponent<{ redis: Devvit.RedisClient; postId: string }> = ({ redis, postId }) => {
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
      const newSeconds = seconds - 1;
      setSeconds(newSeconds);
      await redis.set(key(postId), String(Date.now() + newSeconds * 1000));
    }
  }, 1000);

  timer.start();

  return (
    <vstack gap="medium" alignment="center middle">
      <text size="xxlarge" weight="bold">Time Left: {formatTime(seconds)}</text>
    </vstack>
  );
};

export { Timer }; 
