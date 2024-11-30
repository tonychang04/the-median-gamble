import { Devvit, useState } from '@devvit/public-api';
import { Timer } from './timer.js';
import { Rules } from './rules.js';

export const App = (context: Devvit.Context): JSX.Element => {

  const [username] = useState<string | null>(async () => {
    if (!context.userId) {
      return null;
    }
    const user = await context.reddit.getUserById(context.userId);
    return user?.username ?? null;
  });

  const [showRules, setShowRules] = useState(false);


  return showRules ? (
    <Rules onBack={() => setShowRules(false)} />
  ) : (
    <vstack 
      gap="large" 
      alignment="center middle" 
      padding="large"
      backgroundColor="neutral-background"
    >
      {username && <text size="large">Hi, {username}!</text>}
      <text size="xlarge" weight="bold">Welcome to Median Gamble</text>

      <text size="medium" alignment="center">
          Think you can outsmart the others? 🧠 Guess the number closest to the median without going over it.
      </text>    

      <Timer {...context} />

      <hstack gap="medium">
        <button
          onPress={() => {
            console.log("Navigate to game");
          }}
          appearance="primary"
          size="large"
        >
          Start Playing Now! 🎯
        </button>
        
        <button
          onPress={() => setShowRules(true)}
          size="large"
        >
          Rules 📋
        </button>
      </hstack>
    </vstack>
  );
};
