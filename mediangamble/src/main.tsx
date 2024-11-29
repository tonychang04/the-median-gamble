// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';
import { App } from './app.js';

Devvit.configure({
  redis: true,
  redditAPI: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Median Gamble',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height={100} width={100} alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Created post!' });
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Median Gamble',
  height: 'regular',
  render: App,
});

export default Devvit;
