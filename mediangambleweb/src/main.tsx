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

    const [webviewVisible, setWebviewVisible] = useState(false);

    const onStartGame = () => {
      setWebviewVisible(true);
    };

    return (
      <vstack grow padding="small">
        <vstack
          grow={!webviewVisible}
          height={webviewVisible ? '0%' : '100%'}
          alignment="middle center"
        >
          <text size="xlarge" weight="bold">
            Median Number Guessing Game
          </text>
          <spacer size="large" />
          <text size="medium">Welcome, {username}!</text>
          <spacer size="medium" />
          <Timer redis={context.redis} postId={context.postId} />
          <spacer size="large" />
          <button onPress={onStartGame}>Play Game</button>
        </vstack>
        <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
          <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="medianGame"
              url="page.html"
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
