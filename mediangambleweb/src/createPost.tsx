import { Devvit } from '@devvit/public-api';
import { LoadingState } from './loadingState.js';

// Configure Devvit's plugins
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Adds a new menu item to the subreddit allowing to create a new post
Devvit.addMenuItem({
  label: 'Create New Median Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Median Gamble',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: LoadingState(),
    });
    ui.showToast({ text: 'Created post!' });
    ui.navigateTo(post);
  },
});

// Add daily scheduler to create new posts
Devvit.addSchedulerJob({
  name: 'daily-median-game',
  onRun: async (_event, context) => {
    const { reddit, scheduler, redis } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    // Get and increment the count
    const count = parseInt(await redis.get('gameCount') || '0', 10);
    await redis.set('gameCount', (count + 1).toString());
    
    // Create today's post
    await reddit.submitPost({
      title: `Median Gamble #${count + 1} - ${new Date().toLocaleDateString()}`,
      subredditName: subreddit.name,
      preview: LoadingState(),
    });

    // Schedule next post for tomorrow at midnight PST (8:00 UTC)
    await scheduler.runJob({
      name: 'daily-median-game',
      cron: '0 8 * * *'  // Run at midnight PST (8:00 UTC)
    });
  }
});
