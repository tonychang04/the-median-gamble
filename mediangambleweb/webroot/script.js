class App {
  constructor() {
    console.log("App initialized");
    
    const guessInput = document.querySelector('#guess-input');
    const submitButton = document.querySelector('#submit-guess');
    const lastGuessDisplay = document.querySelector('#last-guess');
    const messageOutput = document.querySelector('#message-output');
    const backButton = document.querySelector('#back-button');


    // Add message listener for game results
    window.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      if (type === 'devvit-message') {
        const {message} = data; 
        
        if (message.type === 'gameResults') {
          const { median, userGuess, totalPlayers } = message.data;
          const medianElement = document.querySelector('#median-value');
          const guessElement = document.querySelector('#your-guess');
          const messageElement = document.querySelector('#result-message');

          if (medianElement) medianElement.textContent = `Final Median: ${median}`;
          if (guessElement) guessElement.textContent = `Your Guess: ${userGuess}`;
          if (messageElement) messageElement.textContent = `Total Players: ${totalPlayers}`;
        }

        if (message.type === 'initialGuess') {
          const { guess } = message.data;
          if (guess) lastGuessDisplay.textContent = `Your last guess: ${guess}`;
        }
          
        if (message.type === 'endGame') {
          window.parent.postMessage({
            type: 'endGame'
          }, '*');
        }
      }
    });

    submitButton.addEventListener('click', () => {
      const guessValue = guessInput.value;
      const guess = parseInt(guessValue);
      if (guess >= 1 && guess <= 100) {
        
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
    
    
    backButton.addEventListener('click', () => {
      console.log("Back button clicked");
      window.parent.postMessage({
        type: 'closeWebview'
      }, '*');
    });

  }
}

new App();