import { Devvit } from '@devvit/public-api';
import { LoadingState } from './loadingState.js';

// Configure Devvit's plugins
Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addSchedulerJob({
  name: 'daily_median_gamble',
  onRun: async (_, context) => {
    try {
      // Get the current game number
      let gameNumber = 1;
      const storedNumber = await context.redis.get('median_gamble_number');
      if (storedNumber) {
        gameNumber = parseInt(storedNumber) + 1;
      }
      
      // Create the post
      const subreddit = await context.reddit.getCurrentSubreddit();
      await context.reddit.submitPost({
        subredditName: subreddit.name,
        title: `The Median Gamble #${gameNumber}`,
        text: `Welcome to game #${gameNumber} of The Median Gamble! Make your predictions wisely.`,
      });
      
      // Store the updated game number
      await context.redis.set('median_gamble_number', gameNumber.toString());
    } catch (error) {
      console.error('Error creating daily median gamble:', error);
    }
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      // Initialize game number if it doesn't exist
      const exists = await context.redis.get('median_gamble_number');
      if (!exists) {
        await context.redis.set('median_gamble_number', '0');
      }
      
      // Schedule daily post
      const jobId = await context.scheduler.runJob({
        name: 'daily_median_gamble',
        cron: '0 12 * * *', // Runs daily at 12:00 UTC
      });
      await context.redis.set('daily_median_gamble_job_id', jobId);
    } catch (error) {
      console.error('Error scheduling daily median gamble:', error);
    }
  },
});

// Manual creation menu item
Devvit.addMenuItem({
  label: 'Create New Median Gamble',
  location: 'subreddit',
  onPress: async (_event, context) => {
    try {
      const { reddit, ui } = context;
      
      // Get and increment game number
      let gameNumber = 1;
      const storedNumber = await context.redis.get('median_gamble_number');
      if (storedNumber) {
        gameNumber = parseInt(storedNumber) + 1;
      }
      
      // Create the post
      const subreddit = await reddit.getCurrentSubreddit();
      const post = await reddit.submitPost({
        title: `The Median Gamble #${gameNumber}`,
        subredditName: subreddit.name,
        preview: LoadingState(),
      });
      
      // Store the updated game number
      await context.redis.set('median_gamble_number', gameNumber.toString());
      
      ui.showToast({ text: 'Created new Median Gamble!' });
      ui.navigateTo(post);
    } catch (error) {
      console.error('Error creating manual median gamble:', error);
      context.ui.showToast({ 
        text: 'Failed to create new game', 
        appearance: 'neutral'
      });
    }
  },
});

