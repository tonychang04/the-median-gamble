type PlayerGuess = {
  username: string;
  guess: number;
};

type GameResults = {
  median: number;
  userGuess: string | number;
  totalPlayers: number;
  allGuesses: PlayerGuess[];
};

export async function calculateGameResults(
  redis: any, 
  postId: string, 
  username: string
): Promise<GameResults> {
  // Get all guesses from Redis hash
  const allGuesses = await redis.hGetAll(`guess:${postId}`);
 // console.log('Found keys:', allGuesses);
  
  // Convert to array of player guesses
  const playerGuesses: PlayerGuess[] = Object.entries(allGuesses).map(([user, guess]) => ({
    username: user,
    guess: Number(guess)
  })).sort((a, b) => a.guess - b.guess);  // Sort by guess value

  const guesses = playerGuesses.map(pg => pg.guess);
  
  // Calculate median
  const validGuesses = guesses.filter((g): g is number => g !== null);
  const mid = Math.floor(validGuesses.length / 2);
  const median = validGuesses.length % 2 === 0
    ? (validGuesses[mid - 1] + validGuesses[mid]) / 2
    : validGuesses[mid];

  // Get user's guess
  const userGuess = await redis.hGet(`guess:${postId}`, username);
  
  return {
    median,
    userGuess: userGuess ?? 'No guess submitted',
    totalPlayers: validGuesses.length,
    allGuesses: playerGuesses
  };
}
