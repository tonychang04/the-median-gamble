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

          
          /* populates lots of test data for testing
          const testGuesses = Array(50).fill().map((_, index) => ({
            username: `Player${index}`,
            guess: Math.floor(Math.min(Math.random() * 100 + 10),99)
          }));
          
          const testMedian = testGuesses
          .map(g => g.guess)
          .sort((a, b) => a - b)[Math.floor(testGuesses.length / 2)];
          */
          
          this.updateResults(median, userGuess, totalPlayers);
          this.drawHistogram(allGuesses, median, userGuess);
          this.updatePlayerList(allGuesses, median);
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

  drawHistogram(allGuesses, median, userGuess) {
    const canvas = document.getElementById('histogram');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Add pixel ratio scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    // Update font settings
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    
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
    const yIntervals = 5;
    const maxValue = Math.ceil(maxBinCount / yIntervals) * yIntervals;
    
    bins.forEach((count, i) => {
      const barHeight = (count / maxValue) * (height - 2 * padding);
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
    
    // Draw median line and labels
    if (median) {
        const medianX = padding + ((median / 10) * barWidth);
        
        // Draw vertical median line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';  // Yellow color
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(medianX, height - padding);
        ctx.lineTo(medianX, padding);
        ctx.stroke();
        
        // Reset line style
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        // Add "Median" label at top
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Median', medianX, padding - 20);  // Label text
        ctx.fillText(median, medianX, padding - 5);     // Median value
        
        // Reset fill style
        ctx.fillStyle = 'white';
    }
    
    // Draw user guess line if it exists and is a number
    if (userGuess && !isNaN(userGuess)) {
        const userX = padding + ((userGuess / 10) * barWidth);
        
        // Draw vertical user guess line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';  // Green color
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(userX, height - padding);
        ctx.lineTo(userX, padding);
        ctx.stroke();
        
        // Add "Your Guess" label
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('Your Guess', userX, padding - 35);
        ctx.fillText(userGuess, userX, padding - 20);
    }
    
    // Draw x-axis interval labels (0, 10, 20, etc)
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * barWidth);
      ctx.fillText(i * 10, x, height - padding + 20);
    }
    
    // Draw Y-axis labels
    for (let i = 0; i <= yIntervals; i++) {
      const value = Math.floor((i * maxValue) / yIntervals);
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
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Guess Range', width/2, height - padding + 40);
  }

  updatePlayerList(allGuesses, median) {
    const playerListElement = document.querySelector('#player-list');
    if (!playerListElement) return;

    // Use mock data if allGuesses is empty
    const guessesToUse = allGuesses
    const medianValue = median;

    // Filter out guesses above median, sort by closest, and take top 5
    const sortedGuesses = [...guessesToUse]
        .filter(player => player.guess <= medianValue)
        .sort((a, b) => {
            const diffA = Math.abs(a.guess - medianValue);
            const diffB = Math.abs(b.guess - medianValue);
            return diffA - diffB;
        })
        .slice(0, 5);  // Only take top 5 winners

    // Create table
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    // Add header
    const header = table.createTHead();
    const headerRow = header.insertRow();
    ['Rank', 'Player', 'Guess'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    // Add body
    const tbody = table.createTBody();
    sortedGuesses.forEach((player, index) => {
        const row = tbody.insertRow();
        
        // Add cells
        const cells = [
            `#${index + 1}`,
            player.username || 'Anonymous',
            player.guess
        ];
        
        cells.forEach(text => {
            const cell = row.insertCell();
            cell.textContent = text;
        });
    });

    // Clear and append
    playerListElement.innerHTML = '';
    playerListElement.appendChild(table);
  }
}

new App(); 