# The Median Gamble

A strategic number-guessing game where players compete to get closest to the median - with a twist!

## How to Play

1. Each day at midnight PST, a new game begins
2. Players submit one guess between 0 and 100
3. The goal is to be closest to the median of all submitted numbers
4. **Important**: If your guess is OVER the median, you get 0 points!
5. The closest guess that's below or equal to the median wins

## Game Interface

The game features:
- Simple number input interface
- Real-time validation
- Clean Minimalist Design
- Visualization of the median and guess distribution

### Results Page
After the game ends, you'll see:
- The final median value
- Your guess
- A result message
- Two detailed views:
  1. **Guess Distribution**: A histogram showing how all numbers were distributed
  2. **Leaderboard**: See how you ranked against other players

## Strategy Tips

Unlike typical median games, this one has a unique twist:
- Being over the median is an automatic loss
- You want to be as close to the median as possible while staying under it
- Consider that other players know this too!

## For Moderators

Special commands are available to subreddit moderators:
- Start/Stop daily games
- Manually create new games
- Games are automatically posted at midnight PST

## Technical Details

Built using:
- Devvit (Reddit's app platform)
- Custom HTML/CSS/JS for the game interface
- Automated scheduling system
- Real-time data processing

## Contributing

Found a bug or have a suggestion? Please open an issue in our repository.

## License

MIT License - feel free to modify and reuse with attribution.