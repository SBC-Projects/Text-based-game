const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set. Gemini requests will fail until it is provided.');
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function extractTextFromContent(content) {
  if (content == null) {
    return '';
  }
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(extractTextFromContent).join('');
  }
  if (typeof content === 'object') {
    if (typeof content.text === 'string') {
      return content.text;
    }
    return Object.values(content).map(extractTextFromContent).join('');
  }
  return '';
}

function cleanGeminiText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  return text.replace(/\bmodel$/i, '').trim();
}

app.post('/gemini', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server missing Gemini API key.' });
  }

  try {
    const response = await fetch(GEMINI_MODEL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    let text = '';
    if (candidate) {
      text = extractTextFromContent(candidate.content) || extractTextFromContent(candidate);
    }
    if (!text && typeof candidate?.output === 'string') {
      text = candidate.output;
    }
    if (!text && typeof data?.output === 'string') {
      text = data.output;
    }
    if (!text) {
      text = JSON.stringify(data);
    }
    text = cleanGeminiText(text);
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gemini request failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
