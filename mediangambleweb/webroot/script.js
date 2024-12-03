class App {
  constructor() {
    console.log("App initialized");

    // Existing elements
    const closeRulesButton = document.querySelector('.close-rules-button');
    if (closeRulesButton) {
      closeRulesButton.addEventListener('click', () => {
        window.parent?.postMessage({ type: 'closeRules' }, '*');
      });
    }

    // Game elements
    const guessInput = document.querySelector('#guess-input');
    const submitButton = document.querySelector('#submit-guess');
    const messageOutput = document.querySelector('#message-output');
    const numberDisplay = document.querySelector('#number-display');

    if (guessInput && numberDisplay) {
      // Update number display while typing
      guessInput.addEventListener('input', () => {
        numberDisplay.textContent = guessInput.value || '-';
      });
    }

    if (submitButton && guessInput) {
      submitButton.addEventListener('click', () => {
        const guessValue = guessInput.value;
        const guess = parseInt(guessValue);
        if (guess >= 1 && guess <= 100) {
          window.parent?.postMessage(
            { 
              type: 'submitGuess', 
              data: { guess: guessValue }
            },
            '*'
          );
          guessInput.value = '';
          numberDisplay.textContent = '-';
          messageOutput.textContent = `Guess submitted: ${guessValue}`;
        } else {
          messageOutput.textContent = 'Please enter a number between 1 and 100';
        }
      });
    }

    // Listen for messages from the parent
    window.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'initialGuess') {
        const guess = message.data.guess;
        numberDisplay.textContent = guess;
        messageOutput.textContent = `Your initial guess was: ${guess}`;
      }
    });

    // Request initial guess when game page loads
    if (document.querySelector('.game-container')) {
      console.log("Requesting initial guess");
      window.parent?.postMessage({ type: 'requestInitialGuess' }, '*');
    } else {
      console.log("Game container not found");
    }
  }
}

new App();
