const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');  // Add this line

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Store your Claude API key in .env file
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

app.post('/api/ask-claude', async (req, res) => {
  try {
    const { query } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-2.1',
        prompt: `\n\nHuman: You are an AWS Console assistant. I will ask questions about AWS services and tasks. 
          For each response:
          1. Provide a clear explanation
          2. List the exact steps to accomplish the task
          3. For each step, provide the exact UI element selector that needs to be clicked/interacted with
          
          Current question: ${query}
          
          Format your response as JSON with this structure:
          {
            "explanation": "General explanation of the task",
            "steps": [
              {
                "text": "Step description",
                "selector": "CSS selector for the UI element",
                "action": "click/input/select"
              }
            ]
          }

          \n\nAssistant: I will help you with AWS Console navigation. I'll format my response as JSON with steps and selectors.

          \n\nHuman: ${query}

          \n\nAssistant:`
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const jsonMatch = data.completion.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedResponse = JSON.parse(jsonMatch[0]);
      res.json(parsedResponse);
    } else {
      throw new Error('Could not parse Claude response');
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});