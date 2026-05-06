// This server exists only to keep the Gemini API key in .env and proxy requests safely.
// Students should not modify server.js; all frontend logic lives in the browser files.

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Default model if the frontend does not send one.
// For Gemma 4 31B via the Gemini API, use this model ID.
const DEFAULT_MODEL = 'gemma-4-31b-it';

// Only used when the requested model hits quota/rate-limit/resource errors.
const FALLBACK_MODEL = 'gemini-flash-lite-latest';

// Keep this list tight so students cannot send arbitrary model strings into your proxy.
const ALLOWED_MODELS = new Set([
  // Gemma models available to your API key
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',

  // Best fallback alias currently visible to your API key
  'gemini-flash-lite-latest',

  // Other confirmed non-Pro, non-TTS options
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-flash-latest'
]);

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set. Gemini requests will fail until it is provided.');
}

app.use(express.json({ limit: '1mb' }));
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

    if (Array.isArray(content.parts)) {
      return content.parts.map(extractTextFromContent).join('');
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

function buildGeminiUrl(model) {
  const safeModel = encodeURIComponent(model);
  return `${GEMINI_API_BASE_URL}/${safeModel}:generateContent`;
}

function normalizeModel(model) {
  if (typeof model !== 'string' || !model.trim()) {
    return DEFAULT_MODEL;
  }

  const trimmed = model.trim();

  // Backward compatibility with your old frontend value.
  // Your previous app used "gemini-4-31b", but the hosted 31B model is Gemma.
  if (trimmed === 'gemini-4-31b') {
    return 'gemma-4-31b-it';
  }

  return trimmed;
}

async function fetchGeminiResponse(model, prompt) {
  const response = await fetch(buildGeminiUrl(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
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
  } catch {
    data = null;
  }

  return {
    response,
    data,
    bodyText
  };
}

function isQuotaError(response, bodyText) {
  const lowercase = String(bodyText || '').toLowerCase();

  return (
    response.status === 403 ||
    response.status === 429 ||
    response.status === 507 ||
    lowercase.includes('quota') ||
    lowercase.includes('exceeded') ||
    lowercase.includes('resource_exhausted') ||
    lowercase.includes('rate limit') ||
    lowercase.includes('quota exceeded')
  );
}

function extractGeminiText(data) {
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

  return cleanGeminiText(text);
}

app.post('/gemini', async (req, res) => {
  const prompt = req.body.prompt;
  const requestedModel = normalizeModel(req.body.model);

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      error: 'Prompt is required.'
    });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Server missing Gemini API key.'
    });
  }

  if (!ALLOWED_MODELS.has(requestedModel)) {
    return res.status(400).json({
      error: `Unsupported model: ${requestedModel}`,
      allowedModels: Array.from(ALLOWED_MODELS)
    });
  }

  console.log(`Gemini request using model: ${requestedModel}`);

  try {
    let result = await fetchGeminiResponse(requestedModel, prompt);
    let usedModel = requestedModel;
    let usedFallback = false;

    if (!result.response.ok && isQuotaError(result.response, result.bodyText)) {
      console.warn(`Quota/rate-limit issue for ${requestedModel}. Trying fallback model: ${FALLBACK_MODEL}`);

      const fallback = await fetchGeminiResponse(FALLBACK_MODEL, prompt);

      if (fallback.response.ok) {
        result = fallback;
        usedModel = FALLBACK_MODEL;
        usedFallback = true;
      } else {
        return res.status(fallback.response.status).json({
          error: 'Primary model hit quota/rate-limit limits and fallback also failed.',
          requestedModel,
          fallbackModel: FALLBACK_MODEL,
          fallbackResponse: fallback.data || fallback.bodyText
        });
      }
    }

    if (!result.response.ok) {
      return res.status(result.response.status).json({
        error: 'Gemini request failed.',
        requestedModel,
        usedModel,
        details: result.data || result.bodyText
      });
    }

    const text = extractGeminiText(result.data);

    return res.json({
      text,
      model: usedModel,
      requestedModel,
      usedFallback,
      raw: result.data
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Gemini request failed.',
      requestedModel
    });
  }
});

app.get('/gemini/models', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Server missing Gemini API key.'
    });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        method: 'GET',
        headers: {
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const bodyText = await response.text();

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch {
      return res.status(response.status).send(bodyText);
    }

    const models = (data.models || []).map(model => ({
      name: model.name,
      displayName: model.displayName,
      supportedGenerationMethods: model.supportedGenerationMethods
    }));

    res.status(response.status).json(models);
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Could not list Gemini models.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Default Gemini model: ${DEFAULT_MODEL}`);
});