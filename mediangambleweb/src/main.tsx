import './createPost.js';
import { Devvit, useState } from '@devvit/public-api';
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
      if (message.type === 'closeRules') {
        setWebviewVisible('');
      }
      if (message.type === 'submitGuess') {
        try {
          const guessValue = message.data.guess;
          await context.redis.set(
            `guess:${context.postId}:${username}`, 
            `${guessValue}`
          );
          context.ui.showToast('Guess submitted successfully!');
        } catch (error) {
          // Handle error if guess submission fails
        }
      }
      if (message.type === 'requestInitialGuess') {
        try {
          const existingGuess = await context.redis.get(`guess:${context.postId}:${username}`);
          context.ui.webView.postMessage(
            JSON.stringify({ 
              type: 'initialGuess',
              data: { guess: existingGuess || '-' } 
            }), 
            'medianGame'
          );
        } catch (error) {
          console.error('Error fetching initial guess:', error);
        }
      }
    };

    return (
      <vstack grow padding="small" backgroundColor="#1a1a1a">
        <vstack
          grow={webviewVisible.length !== 0}
          height={webviewVisible.length !== 0 ? '0%' : '100%'}
          alignment="middle center"
        >
          <text size="xlarge" weight="bold" color="white">
            Median Number Guessing Game
          </text>
          <spacer size="large" />
          <text size="medium" color="white">Welcome, {username}!</text>
          <spacer size="medium" />
          <Timer redis={context.redis} postId={context.postId ?? ''} />
          <spacer size="large" />
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
              url={webviewVisible === 'rules' ? 'rules.html' : 'game.html'}
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
  