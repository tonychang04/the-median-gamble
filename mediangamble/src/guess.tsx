import { Devvit, useState, useForm } from '@devvit/public-api';
import { Timer } from './timer.js';

export const GuessPage = ({ context, onBack }: { context: Devvit.Context, onBack: () => void }): JSX.Element => {
  const [guess, setGuess] = useState<string | null>(null);
  const [error, setError] = useState('');

  const guessForm = useForm(
    {
      title: 'Submit Your Guess',
      description: 'Enter a number between 0 and 100. The closest guess to the median without going over wins!',
      fields: [
        {
          type: 'number',
          name: 'guess',
          label: 'Your Guess (0-100)',
        }
      ],
      acceptLabel: 'Submit Guess',
      cancelLabel: 'Cancel'
    },
    async (values) => {
      const numGuess = Number(values.guess);
      
      if (isNaN(numGuess) || numGuess < 0 || numGuess > 100) {
        context.ui.showToast({ text: 'Please enter a valid number between 0 and 100', appearance: 'neutral' });
        return;
      }

      const existingGuess = await context.redis.get(`guess:${context.postId}:${context.userId}`);
      if (existingGuess) {
        context.ui.showToast({ text: 'You have already submitted a guess!', appearance: 'neutral' });
        return;
      }

      await context.redis.set(`guess:${context.postId}:${context.userId}`, String(numGuess));
      setGuess(String(numGuess));
      context.ui.showToast({ text: 'Guess submitted successfully!', appearance: 'success' });
    }
  );

  return (
    <vstack 
      gap="large" 
      alignment="center middle" 
      padding="large"
      backgroundColor="neutral-background"
    >
      <Timer {...context} />
      
      <text size="xlarge" weight="bold">Make Your Guess!</text>
      
      <vstack gap="medium" alignment="center middle">
        {guess ? (
          <vstack gap="medium" alignment="center middle">
            <text size="large">Your guess: {guess}</text>
            <text size="medium" color="green">Guess submitted! Good luck! 🍀</text>
          </vstack>
        ) : (
          <button 
            onPress={() => context.ui.showForm(guessForm)} 
            appearance="primary" 
            size="large"
          >
            Submit Your Guess 🎯
          </button>
        )}
      </vstack>

      <button onPress={onBack} size="medium">
        Back to Menu
      </button>
    </vstack>
  );
};
