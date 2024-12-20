import './createPost.js';
import { Devvit, useState, useInterval} from '@devvit/public-api';
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

    const [webviewVisible, setWebviewVisible] = useState('');

    const [guessCount, setGuessCount] = useState(async () => {
      const guesses = await context.redis.hKeys(`guess:${context.postId}`);
      return guesses.length;
    });

    const handleMessage = async (message: WebViewMessage) => {
      if (message.type === 'closeWebview') {
        setWebviewVisible('');
      }
      if (message.type === 'submitGuess') {
        try {
          const guessValue = message.data.guess;
          await context.redis.hSet(
            `guess:${context.postId}`,
            { [username] : guessValue }
          );
        } catch (error) {
          // Handle error if guess submission fails
        }
      }
    };

    const handlePlayGame = async () => {
      setWebviewVisible('games');
      const savedGuess = await context.redis.hGet(`guess:${context.postId}`, username);
      if (savedGuess) {
        console.log('Sending initial guess');
        context.ui.webView.postMessage('medianGame', {
          type: 'initialGuess',
          data: { guess: savedGuess }
        });
        console.log('Initial guess sent');
      }
    };

    const isMobile = (context.dimensions?.width ?? 800) < 400;

    if (isMobile) {
      return (
        <vstack 
          grow 
          padding="large" 
          backgroundColor="#1a1a1a" 
          alignment="middle center"
        >
          <text 
            size="xlarge" 
            weight="bold" 
            color="white" 
            alignment="center"
          >
            Mobile/App Not Supported
          </text>
          <spacer size="medium" />
          <text 
            color="white" 
            alignment="center"
          >
            Please visit this game on desktop/web
          </text>
          <text 
            color="white" 
            alignment="center"
          >
            for the best experience.
          </text>
        </vstack>
      );
    }

    return (
      <vstack grow padding="small" backgroundColor="#1a1a1a">
        <Timer 
          redis={context.redis} 
          postId={context.postId ?? ''} 
          context={context}
          setWebviewVisible={setWebviewVisible}
          webviewVisible={webviewVisible}
        />
        {webviewVisible !== 'conclusion' && (
          <hstack alignment="middle center">
            <text color="white" size="large">
              Player Guesses: 
            </text>
            <text color="white" size="large" weight="bold">
              {guessCount}
            </text>
          </hstack>
        )}
        <vstack grow={webviewVisible.length !== 0}  alignment="middle center" height={webviewVisible.length !== 0 ? '0%' : '100%'} >
          <text size="xxlarge" weight="bold" color="white">
              The Median Gamble
            </text>
            <vstack padding="large">
              <text 
                size="large" 
                color="white" 
                alignment="center"
                wrap={true}
              >
                Welcome, {username}! To the world of guess, lies, and strategy—think you can outsmart fellow peers and the Reddit community? Choose your guess wisely.
              </text>
            </vstack>
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
                  ? 'rulesPage/rules.html' 
                  : webviewVisible === 'conclusion'
                    ? 'conclusionPage/conclusion.html'
                    : 'gamePage/game.html'
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
  