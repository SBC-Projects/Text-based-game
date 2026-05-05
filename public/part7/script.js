// script.js - Part 7: Guidable Story Telling System with Story Bible and State Management

import { GoogleGenAI } from './ai-client.js';

// Initialize AI client
const ai = new GoogleGenAI({});

// ============================================================
// STORY BIBLE - Static story framework (role, tone, rules)
// ============================================================
const storyBible = `
Genre: dark fantasy mystery.
Tone: eerie, intimate, grounded.
Setting: the drowned city of Velrath, where bells ring beneath the waves.
Main mystery: Why do the bells ring under the water? What lies below?
Plot rules:
- Give the player meaningful choices that affect the story state.
- Keep responses vivid but under 250 words.
- Responses must be valid JSON only - no markdown, no extra text.
- Always include: narration, choices array, stateUpdate object.

Characters:
- Mara: A local guide who knows the city's secrets
- The Bells: An unknown force creating the mysterious sound
`;

// ============================================================
// STORY STATE - Dynamic story progression (persistent between turns)
// ============================================================
let storyState = {
  location: "town square",
  time: "dusk",
  inventory: ["travel cloak"],
  discoveredClues: [],
  visitedLocations: ["town square"],
  activeNPCs: ["Mara"],
  tension: 3,
  turnsPlayed: 0,
  
  // Hidden state for plot control (guides foreshadowing, not revealed)
  _hidden: {
    trueVillain: "the drowned god beneath Velrath",
    bellCause: "a divine awakening",
    revealStage: 0
  }
};

// ============================================================
// CHAT HISTORY - Track recent messages (local context)
// ============================================================
let chatHistory = [];
const MAX_CHAT_HISTORY = 4;

function addChatEntry(role, content) {
  chatHistory.push({ role, content });
  if (chatHistory.length > MAX_CHAT_HISTORY) {
    chatHistory.shift();
  }
}

// ============================================================
// DISPLAY STORY STATE - Show player's current game state
// ============================================================
function displayStoryState() {
  // Show only public state to the player
  const stateDiv = document.getElementById('storyState');
  if (!stateDiv) return;

  stateDiv.innerHTML = `
    <div><strong>📍 Location:</strong> ${storyState.location}</div>
    <div><strong>🕐 Time:</strong> ${storyState.time}</div>
    <div><strong>▓ Tension:</strong> ${'█'.repeat(storyState.tension)}${'░'.repeat(10 - storyState.tension)}</div>
    <div><strong>🎒 Inventory:</strong> ${storyState.inventory.join(', ') || '(empty)'}</div>
    <div><strong>💡 Clues:</strong> ${storyState.discoveredClues.join(', ') || '(none yet)'}</div>
  `;
}

// ============================================================
// PARSE JSON RESPONSE - Extract story data from Gemini
// ============================================================
function parseStoryResponse(responseText) {
  try {
    return JSON.parse(responseText);
  } catch (e) {
    // Handle markdown code blocks
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // Extract raw JSON object
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
    }
    throw new Error('Could not parse JSON from response');
  }
}

// ============================================================
// DISPLAY CHOICES - Create clickable action buttons
// ============================================================
function displayChoices(choices, container) {
  container.innerHTML = '';
  if (!choices || !Array.isArray(choices)) return;

  choices.forEach(choice => {
    const button = document.createElement('button');
    button.textContent = choice;
    button.className = 'choice-button';
    button.addEventListener('click', () => {
      const input = document.getElementById('input');
      input.value = choice;
      sendStoryRequest(choice);
    });
    container.appendChild(button);
  });
}

// ============================================================
// SEND STORY REQUEST - Main engine: build context and query AI
// ============================================================
async function sendStoryRequest(userAction) {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const narrationDiv = document.getElementById('narration');
  const choicesDiv = document.getElementById('choices');

  if (!userAction) {
    output.textContent = 'Choose an action or enter one.';
    return;
  }

  input.value = '';
  output.textContent = 'Weaving the story...';

  try {
    const modelSelect = document.getElementById('modelSelect');
    const model = modelSelect ? modelSelect.value : 'gemini-4-31b';

    // Increment turn counter
    storyState.turnsPlayed++;

    // Build the complete prompt with story context
    const systemInstruction = `You are a master storyteller and game master for interactive fiction.

CRITICAL: Return ONLY valid JSON, no markdown or extra text.

Use the Story Bible and Story State as absolute canon. Do not contradict them.
Advance the story based on the player's action.
Update story state to reflect consequences of player choices.
Use hidden state to guide foreshadowing and plot, but do not reveal it directly.

Return JSON with exactly these fields:
{
  "narration": "vivid story text, max 250 words",
  "choices": ["action 1", "action 2", "action 3"],
  "stateUpdate": { updated state fields as key-value pairs }
}`;

    // Format recent chat for context
    const recentChatText = chatHistory.length > 0
      ? JSON.stringify(chatHistory, null, 2)
      : "(no prior messages)";

    // Build complete prompt
    const contents = `STORY BIBLE:
${storyBible}

CURRENT STORY STATE:
${JSON.stringify(storyState, null, 2)}

RECENT MESSAGES:
${recentChatText}

PLAYER ACTION:
${userAction}`;

    // Query Gemini
    const data = await ai.models.generateContent({
      model,
      contents
    });

    // Parse response
    const storyResponse = parseStoryResponse(data.text);

    // Track in chat history
    addChatEntry('user', userAction);
    addChatEntry('assistant', JSON.stringify(storyResponse));

    // Apply state update
    if (storyResponse.stateUpdate) {
      Object.assign(storyState, storyResponse.stateUpdate);
    }

    // Display story
    narrationDiv.textContent = storyResponse.narration;
    displayChoices(storyResponse.choices, choicesDiv);
    output.textContent = '';

    // Refresh state display
    displayStoryState();

  } catch (error) {
    output.textContent = 'Story engine error: ' + error.message;
    console.error(error);
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.getElementById('enterButton').addEventListener('click', () => {
  sendStoryRequest(document.getElementById('input').value);
});

document.getElementById('input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendStoryRequest(document.getElementById('input').value);
  }
});

// Initialize on load
window.addEventListener('load', () => {
  displayStoryState();
  console.log('Story engine loaded. Ready to begin.');
});