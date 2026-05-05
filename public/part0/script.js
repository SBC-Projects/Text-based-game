import { GoogleGenAI } from './ai-client.js';
import { Person } from './person.js';
import { analyseInput } from './analyse-input.js';
import { setupUIHandlers, updateOutput, clearGeminiInput } from './ui.js';

const ai = new GoogleGenAI({});
const player = new Person();

setupUIHandlers({
  onCommand(command) {
    analyseInput(command, player);
  },
  onGemini(prompt) {
    sendToGemini(prompt);
  }
});

async function sendToGemini(prompt) {
  if (!prompt) {
    updateOutput('Enter a question for Gemini.');
    return;
  }

  clearGeminiInput();
  updateOutput('Waiting for Gemini...');

  try {
    const data = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt
    });

    updateOutput(data.text || 'No response from Gemini.');
  } catch (error) {
    updateOutput('Gemini request failed: ' + error.message);
  }
}




