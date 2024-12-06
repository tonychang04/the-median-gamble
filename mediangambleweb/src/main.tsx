import './createPost.js';
import { Devvit, useState, Context } from '@devvit/public-api';
import { Timer } from './Timer.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Median Gamble',
  height: 'tall',
  render: (context) => {
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    const [webviewVisible, setWebviewVisible] = useState('');

    const handleMessage = async (message: any) => {
      if (message.type === 'closeWebview') {
        setWebviewVisible('');
      }
      if (message.type === 'submitGuess') {
        try {
          const guessValue = message.data.guess;
          await context.redis.hSet(
            `guess:${context.postId}:${username}`,
            guessValue
          );
          context.ui.webView.postMessage('medianGame', {
            type: 'devvit-message',
            message: 'Guess saved successfully'
          });
        } catch (error) {
          // Handle error if guess submission fails
        }
      }
      if (message.type === 'requestInitialGuess') {
        try {
          const savedGuess = await context.redis.get(`guess:${context.postId}:${username}`);
          if (savedGuess) {
            context.ui.webView.postMessage('medianGame', {
              type: 'initialGuess',
              data: { guess: savedGuess }
            });
          }
        } catch (error) {
          console.error('Error fetching initial guess:', error);
        }
      }
      if (message.type === 'gameEnded' || webviewVisible === 'conclusion') {
        try {
          // Get all guesses from Redis hash
          const allGuesses = await context.redis.hGetAll(`guess:${context.postId}:*`);
          console.log('Found keys:', allGuesses);

          const guesses = Object.values(allGuesses).map((value) => Number(value));

          // Filter out null values and calculate median
          const validGuesses = guesses.filter((g): g is number => g !== null);
          console.log('Valid guesses:', validGuesses);
          const sortedGuesses = [...validGuesses].sort((a, b) => a - b);
          const mid = Math.floor(sortedGuesses.length / 2);
          const median = sortedGuesses.length % 2 === 0
            ? (sortedGuesses[mid - 1] + sortedGuesses[mid]) / 2
            : sortedGuesses[mid];

          // Get user's guess
          const userGuess = await context.redis.get(`guess:${context.postId}:${username}`);
          
          console.log(median, userGuess, validGuesses.length);  
          // Send results to webview
          context.ui.webView.postMessage('medianGame', {
            type: 'gameResults',
            data: {
              median: median,
              userGuess: userGuess ?? 'No guess submitted',
              totalPlayers: validGuesses.length
            }
          });
        } catch (error) {
          console.error('Error calculating results:', error);
        }
      }
    };

    return (
      <vstack grow padding="small" backgroundColor="#1a1a1a">
        <Timer 
          redis={context.redis} 
          postId={context.postId ?? ''} 
          context={context}
          setWebviewVisible={setWebviewVisible}
        />
        <spacer size="medium" />
        <vstack
          grow={webviewVisible.length !== 0}
          height={webviewVisible.length !== 0 ? '0%' : '100%'}
          alignment="middle center"
        >
          <text size="xlarge" weight="bold" color="white">
            The Median Gamble
          </text>
          <spacer size="large" />
          <text size="medium" color="white">Welcome, {username}!</text>
          <spacer size="medium" />
          <hstack gap="medium">
            <button 
              onPress={() => setWebviewVisible('games')}
              appearance="secondary"
              textColor="white"
            >
              Play Game
            </button>
            <button 
              onPress={() => setWebviewVisible('rules')}
              appearance="secondary"
              textColor="white"
            >
              Rules
            </button>
          </hstack>
        </vstack>
        <vstack grow={webviewVisible !== ''} height={webviewVisible ? '100%' : '0%'}>
          <vstack 
            border="thick" 
            borderColor="#333333" 
            backgroundColor="#1a1a1a"
            height={webviewVisible ? '100%' : '0%'}
          >
            <webview
              id="medianGame"
              url={
                webviewVisible === 'rules' 
                  ? 'rules.html' 
                  : webviewVisible === 'conclusion'
                    ? 'conclusion.html'
                    : 'game.html'
              }
              grow
              height={webviewVisible ? '100%' : '0%'}
              onMessage={handleMessage}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
  