class App {
  constructor() {
    console.log("Conclusion initialized");
    this.setupMessageListener();
    this.setupTabSwitcher();
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
          //this.updatePlayerList(allGuesses);
        }
      }
    });
  }

  setupTabSwitcher() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and panels
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked button and corresponding panel
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
      });
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
    
    // Set white text and lines
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.font = 'apple-system';
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create bins (0-100 in groups of 10)
    const bins = Array(10).fill(0);
    allGuesses.forEach(({ guess }) => {
      const binIndex = Math.min(Math.floor(guess / 10), 9);
      bins[binIndex]++;
    });
    
    const maxBinCount = Math.max(...bins, 1); // Actual maximum value
    const displayMax = Math.max(maxBinCount, 5); // Display maximum (for axis)
    const padding = 60;
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
      // Use maxBinCount for bar height calculation, not displayMax
      const barHeight = count * (height - 2 * padding) / maxBinCount;
      const x = padding + i * barWidth;
      const y = height - padding - barHeight;
      
      // Draw bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      
      // Draw count above bar if not zero
      if (count > 0) {
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(count, x + barWidth/2, y - 5);
      }
    });
    
    // Draw x-axis interval labels (0, 10, 20, etc)
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * barWidth);
      ctx.fillText(i * 10, x, height - padding + 20);
    }
    
    // Draw Y-axis labels with fixed intervals
    ctx.textAlign = 'right';
    ctx.fillStyle = 'white';
    
    // Calculate nice y-axis intervals
    const yIntervals = 4;
    
    for (let i = 0; i <= yIntervals; i++) {
      const value = Math.round((i * displayMax) / yIntervals);
      const yPos = height - padding - (i * (height - 2 * padding) / yIntervals);
      ctx.fillText(value.toString(), padding - 10, yPos + 5);
      
      // Draw light grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(padding, yPos);
      ctx.lineTo(width - padding, yPos);
      ctx.stroke();
    }
    
    // Draw axis titles
    ctx.fillStyle = 'white';
    
    // X-axis title
    ctx.textAlign = 'center';
    ctx.fillText('Guess Range', width/2, height - 5);
  }

  /*
  updatePlayerList(allGuesses) {
    const playerListElement = document.querySelector('#player-list');
    if (playerListElement) {
      playerListElement.innerHTML = '<h3>All Guesses:</h3>';
      const list = document.createElement('ul');
      allGuesses.forEach(({ username, guess }) => {
        const item = document.createElement('li');
        item.textContent = `${username}: ${guess}`;
        list.appendChild(item);
      });
      playerListElement.appendChild(list);
    }
  }
  */
}

new App(); 