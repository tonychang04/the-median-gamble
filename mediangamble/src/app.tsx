import { Devvit, useState } from '@devvit/public-api';
import { Timer } from './timer.js';

export const App = (context: Devvit.Context): JSX.Element => {
  const [username, setUsername] = useState('');

  // Fetch username when component mounts
  context.reddit.getCurrentUser().then(user => {
    setUsername(user?.username ?? '');
  });

  return (
    <vstack gap="medium" alignment="center middle">
      <text size="xlarge" weight="bold">Welcome to Median Gamble</text>
      {username && <text size="large">Hi, {username}!</text>}
      
      <Timer {...context}/>
      
      <button
        onPress={() => {
          // Add navigation to game here
          console.log("Navigate to game");
        }}
      >
        Play Game
      </button>
    </vstack>
  );
};

