// This server exists only to keep the Gemini API key in .env and proxy requests safely.
// Students should not modify server.js; all frontend logic lives in the browser files.
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const GEMINI_FALLBACK_MODEL_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-lite-001:generateContent';

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set. Gemini requests will fail until it is provided.');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

async function fetchGeminiResponse(modelUrl, prompt) {
  const response = await fetch(modelUrl, {
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

  const bodyText = await response.text();
  let data = null;
  try {
    data = JSON.parse(bodyText);
  } catch (error) {
    data = null;
  }

  return { response, data, bodyText };
}

function isQuotaError(response, bodyText) {
  const lowercase = String(bodyText || '').toLowerCase();
  return response.status === 403 || response.status === 429 || response.status === 507 ||
    lowercase.includes('quota') ||
    lowercase.includes('exceeded') ||
    lowercase.includes('resource_exhausted') ||
    lowercase.includes('rate limit') ||
    lowercase.includes('quota exceeded');
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
    let result = await fetchGeminiResponse(GEMINI_MODEL_URL, prompt);
    let usedModel = GEMINI_MODEL_URL;

    if (!result.response.ok && isQuotaError(result.response, result.bodyText)) {
      const fallback = await fetchGeminiResponse(GEMINI_FALLBACK_MODEL_URL, prompt);
      if (fallback.response.ok) {
        result = fallback;
        usedModel = GEMINI_FALLBACK_MODEL_URL;
      } else {
        const fallbackText = fallback.bodyText || 'Fallback model failed.';
        return res.status(fallback.response.status).send(`Primary quota error; fallback failed: ${fallbackText}`);
      }
    }

    if (!result.response.ok) {
      return res.status(result.response.status).send(result.bodyText || 'Gemini request failed.');
    }

    const data = result.data;
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
    res.json({ text, model: usedModel });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gemini request failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
