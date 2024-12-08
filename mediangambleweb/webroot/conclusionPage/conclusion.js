class App {
  constructor() {
    console.log("Conclusion initialized");
    this.setupMessageListener();
    this.setupTabSwitcher();
  }

  setupTabSwitcher() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and panels
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => 
          panel.classList.remove('active')
        );
        
        // Add active class to clicked button and its panel
        button.classList.add('active');
        const panelId = `${button.dataset.tab}-tab`;
        document.getElementById(panelId).classList.add('active');
      });
    });
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      
      const { type, data } = event.data;
      
      if (type === 'devvit-message') {
        const {message} = data; 
        
        if (message.type === 'gameResults') {
          const { median, userGuess, totalPlayers, allGuesses } = message.data;
          
          this.updateResults(median, userGuess, totalPlayers);
          this.drawHistogram(allGuesses);
          this.updatePlayerList(allGuesses);
        }
      }
    });
  }

  updateResults(median, userGuess, totalPlayers) {
    const medianElement = document.querySelector('#median-value');
    const guessElement = document.querySelector('#your-guess');
    const messageElement = document.querySelector('#result-message');

    if (medianElement) medianElement.textContent = `Final Median: ${median}`;
    if (guessElement) guessElement.textContent = `Your Guess: ${userGuess}`;
    if (messageElement) messageElement.textContent = `Total Players: ${totalPlayers}`;
  }

  drawHistogram(allGuesses) {
    const canvas = document.getElementById('histogram');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Set styles
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create bins (0-100 in groups of 10)
    const bins = Array(10).fill(0);
    allGuesses.forEach(({ guess }) => {
      const binIndex = Math.min(Math.floor(guess / 10), 9);
      bins[binIndex]++;
    });
    
    const maxBinCount = Math.max(...bins, 1);
    const padding = 70;
    const barWidth = (width - 2 * padding) / bins.length;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);  // x-axis
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);  // y-axis
    ctx.stroke();
    
    // Draw bars and labels
    bins.forEach((count, i) => {
      const barHeight = count * (height - 2 * padding) / maxBinCount;
      const x = padding + i * barWidth;
      const y = height - padding - barHeight;
      
      // Draw bar outline only
      ctx.strokeRect(x, y, barWidth - 2, barHeight);
    });
  }

  updatePlayerList(allGuesses) {
    const playerListElement = document.querySelector('#player-list');
    if (playerListElement) {
      playerListElement.innerHTML = '';
      const list = document.createElement('ul');
      list.className = 'player-list';
      
      allGuesses
        .sort((a, b) => b.guess - a.guess)  // Sort by guess value
        .forEach(({ username, guess }, index) => {
          const item = document.createElement('li');
          item.textContent = `${index + 1}. ${username}: ${guess}`;
          list.appendChild(item);
        });
      
      playerListElement.appendChild(list);
    }
  }
}

new App(); 