class RulesApp {
  constructor() {
    console.log("Rules initialized");
    
    const backButton = document.querySelector('#back-button');
    
    backButton.addEventListener('click', () => {
      console.log("Back button clicked");
      window.parent.postMessage({
        type: 'closeWebview'
      }, '*');
    });
  }
}

new RulesApp(); 