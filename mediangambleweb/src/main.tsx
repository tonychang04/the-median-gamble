import './createPost.js';
import { Devvit, useState} from '@devvit/public-api';
import { Timer } from './Timer.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

type WebViewMessage = {
  type: 'closeWebview' | 'submitGuess' | 'endGame' | 'initialGuess';
  data?: any;
};

Devvit.addCustomPostType({
  name: 'Median Gamble',
  height: 'tall',
  render: (context) => {
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // game, rules, conclusion
    const [webviewVisible, setWebviewVisible] = useState('');

    const handleMessage = async (message: WebViewMessage) => {
      if (message.type === 'closeWebview') {
        setWebviewVisible('');
      }
      if (message.type === 'submitGuess') {
        try {
          const guessValue = message.data.guess;
          console.log(username, guessValue);
          console.log(`guess:${context.postId}`);
          await context.redis.hSet(
            `guess:${context.postId}`,
            { [username] : guessValue }
          );
        } catch (error) {
          // Handle error if guess submission fails
        }
      }
  
      if (message.type === 'endGame') {
        try {
          // Get all guesses from Redis hash
          const allGuesses = await context.redis.hGetAll(`guess:${context.postId}`);
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
          const userGuess = await context.redis.hGet(`guess:${context.postId}`, username);
          
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

    const handlePlayGame = async () => {
      setWebviewVisible('games');
      console.log('Getting current guess');
      const savedGuess = await context.redis.hGet(`guess:${context.postId}`, username);
      console.log(savedGuess);
      if (savedGuess) {
        console.log('Sending initial guess');
        context.ui.webView.postMessage('medianGame', {
          type: 'initialGuess',
          data: { guess: savedGuess }
        });
        console.log('Initial guess sent');
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
              onPress={() => handlePlayGame()}
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
              onMessage={(message) => handleMessage(message as WebViewMessage)}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
  