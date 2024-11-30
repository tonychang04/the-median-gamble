import { Devvit } from '@devvit/public-api';

export const Rules = ({ onBack }: { onBack: () => void }): JSX.Element => {
  return (
    <vstack 
      gap="large" 
      alignment="center middle" 
      padding="large"
      backgroundColor="neutral-background"
    >
      <text size="xxlarge" weight="bold">📋 How to Play</text>
      <vstack gap="medium" alignment="start">
        <text>🔢 Pick a number between 0-100</text>
        <hstack gap="none">
          <text>🎯 Your goal: be closest to the </text>
          <spacer />
          <text weight="bold">median</text>
        </hstack>
        <hstack gap="none">
          <text>💡 The </text>
          <spacer />
          <text weight="bold">median </text>
          <spacer />
          <text>is the middle number of all guesses</text>
        </hstack>
        <hstack gap="none">
          <text>⚠️ Guess over the median? </text>
          <spacer />
          <text weight="bold">0 points!</text>
        </hstack>
        <text>🏆 Closest guess below or equal to the median wins!</text>
      </vstack>

      <button
        onPress={onBack}
        size="medium"
      >
        Back to Menu
      </button>
    </vstack>
  );
};
