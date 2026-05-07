require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

// Single unified endpoint — handles both single-turn and multi-turn requests
app.post('/api/claude', async (req, res) => {
  try {
    const { system, user, messages, maxTokens = 900 } = req.body;
    // If messages array provided → multi-turn conversational mode
    // If user string provided → single-turn mode
    const apiMessages = messages || [{ role: 'user', content: user }];
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: system,
        messages: apiMessages
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', errBody?.error?.type || response.status);
      return res.status(500).json({ error: errBody });
    }

    const data = await response.json();
    res.json({ content: data.content[0].text });
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiKeySet: !!API_KEY });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});