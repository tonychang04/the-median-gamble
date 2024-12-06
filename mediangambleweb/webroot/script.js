class App {
  constructor() {
    console.log("App initialized");
    
    const guessInput = document.querySelector('#guess-input');
    const submitButton = document.querySelector('#submit-guess');
    const lastGuessDisplay = document.querySelector('#last-guess');
    const messageOutput = document.querySelector('#message-output');
    const backButton = document.querySelector('#back-button');

    // Load initial guess from localStorage
    const savedGuess = localStorage.getItem('lastGuess');
    if (savedGuess && lastGuessDisplay) {
      lastGuessDisplay.textContent = `Your last guess: ${savedGuess}`;
    }

    // Add message listener for game ended event
    window.addEventListener('message', (event) => {
      if (event.data.type === 'gameEnded') {
        messageOutput.textContent = 'Game has ended!';
        if (submitButton) submitButton.disabled = true;
        if (guessInput) guessInput.disabled = true;
      }
    });

    // Add message listener for game results
    window.addEventListener('message', (event) => {
      if (event.data.type === 'gameResults') {
        const { median, userGuess, totalPlayers } = event.data.data;
        const medianElement = document.querySelector('#median-value');
        const guessElement = document.querySelector('#your-guess');
        const messageElement = document.querySelector('#result-message');

        if (medianElement) medianElement.textContent = `Final Median: ${median}`;
        if (guessElement) guessElement.textContent = `Your Guess: ${userGuess}`;
        if (messageElement) messageElement.textContent = `Total Players: ${totalPlayers}`;
      }
    });

    if (submitButton && guessInput) {
      submitButton.addEventListener('click', () => {
        const guessValue = guessInput.value;
        const guess = parseInt(guessValue);
        if (guess >= 1 && guess <= 100) {
          // Save to localStorage
          localStorage.setItem('lastGuess', guessValue);
          
          // Send to parent (Devvit)
          window.parent.postMessage({
            type: 'submitGuess',
            data: { guess: guessValue }
          }, '*');
          
          guessInput.value = '';
          lastGuessDisplay.textContent = `Your last guess: ${guessValue}`;
          messageOutput.textContent = 'Guess submitted!';
        } else {
          messageOutput.textContent = 'Please enter a number between 1 and 100';
        }
      });
    }

    // Universal back button handler
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.parent.postMessage({
          type: 'closeWebview'
        }, '*');
      });
    }

    // Request initial data when conclusion page loads
    if (window.location.pathname.includes('conclusion.html')) {
      window.parent.postMessage({
        type: 'gameEnded'
      }, '*');
    }
  }
}

// Create new instance
const app = new App();
