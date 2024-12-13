import { Devvit } from '@devvit/public-api';
import { LoadingState } from './loadingState.js';

// Configure Devvit's plugins
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Define the job
Devvit.addSchedulerJob({
  name: 'create_median_gamble',
  onRun: async (_, context) => {
    try {
      let gameNumber = 1;
      const storedNumber = await context.redis.get('median_gamble_number');
      if (storedNumber) {
        gameNumber = parseInt(storedNumber) + 1;
      }
      
      const subreddit = await context.reddit.getCurrentSubreddit();
      await context.reddit.submitPost({
        title: `The Median Gamble Beta #${gameNumber}`,
        subredditName: subreddit.name,
        preview: LoadingState(),
      });
      
      await context.redis.set('median_gamble_number', gameNumber.toString());
    } catch (error) {
      console.error('Error in scheduler:', error);
    }
  },
});

// Schedule recurring job
Devvit.addMenuItem({
  label: 'Start Daily Median Gamble Games',
  location: 'subreddit',
  onPress: async (_, context) => {
    const jobId = await context.scheduler.runJob({
      name: 'create_median_gamble',
      cron: '0 8 * * *'  // Runs at 00:00 PST (08:00 UTC) every day
    });
    await context.redis.set('median_gamble_job_id', jobId);
    context.ui.showToast({ text: 'Daily games scheduled!' });
  },
});

// Cancel job
Devvit.addMenuItem({
  label: 'Stop Daily Games',
  location: 'subreddit',
  onPress: async (_, context) => {
    const jobId = await context.redis.get('median_gamble_job_id');
    if (jobId) {
      await context.scheduler.cancelJob(jobId);
      await context.redis.del('median_gamble_job_id');
      context.ui.showToast({ text: 'Daily games stopped!' });
    } else {
      context.ui.showToast({ text: 'No daily games scheduled!' });
    }
  },
});

export default Devvit;
