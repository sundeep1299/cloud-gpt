chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlight') {
      removeHighlights();
      highlightElements(request.steps);
    }
  });
  
  function removeHighlights() {
    document.querySelectorAll('.aws-assistant-highlight').forEach(el => {
      el.classList.remove('aws-assistant-highlight');
      const badge = el.querySelector('.step-badge');
      if (badge) badge.remove();
    });
  }
  
  function highlightElements(steps) {
    steps.forEach((step, index) => {
      const element = document.querySelector(step.selector);
      if (element) {
        element.classList.add('aws-assistant-highlight');
        
        // Add step number and action type
        const badge = document.createElement('div');
        badge.className = 'step-badge';
        badge.innerHTML = `${index + 1}<br><small>${step.action}</small>`;
        element.appendChild(badge);
      }
    });
  }
  