// popup.js
let apiKey = '';

// Load API key on popup open
chrome.storage.local.get(['claudeApiKey'], (result) => {
  if (result.claudeApiKey) {
    apiKey = result.claudeApiKey;
    document.getElementById('api-key').value = apiKey;
  }
});

// Save API key when entered
document.getElementById('api-key').addEventListener('change', (e) => {
  apiKey = e.target.value;
  chrome.storage.local.set({ claudeApiKey: apiKey });
});

function addMessage(text, isUser) {
  const chatContainer = document.getElementById('chat-container');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendToClaude(query) {
  try {
    const response = await fetch('http://localhost:3000/api/ask-claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Server Error (${response.status}): ${errorData}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

async function handleQuery(query) {
  try {
    addMessage(query, true);
    
    const response = await sendToClaude(query);
    if (!response) return;

    // Display explanation
    addMessage(response.explanation, false);

    // Display steps
    response.steps.forEach(step => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'step';
      stepDiv.textContent = step.text;
      document.querySelector('.assistant-message:last-child').appendChild(stepDiv);
    });

    // Send highlighting instructions to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
      action: 'highlight',
      steps: response.steps
    });

  } catch (error) {
    addMessage('Error: ' + error.message, false);
  }
}

// Handle send button click
document.getElementById('send-button').addEventListener('click', () => {
  const query = document.getElementById('query-input').value;
  if (query.trim()) {
    handleQuery(query);
    document.getElementById('query-input').value = '';
  }
});

// Handle enter key
document.getElementById('query-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    handleQuery(e.target.value);
    e.target.value = '';
  }
});