// Import the GoogleGenAI client for making requests to Gemini
import { GoogleGenAI } from './ai-client.js';

// Initialize the AI client
const ai = new GoogleGenAI({});

// Function to handle user input and send to Gemini
async function sendToGemini() {
    // Get references to the input field and output paragraph
    const input = document.getElementById('input');
    const output = document.getElementById('output');

    // Get the user's prompt
    const prompt = input.value;

    // Check if the input is empty
    if (!prompt) {
        output.textContent = 'Please enter a question for Gemini.';
        return;
    }

    // Clear the input field
    input.value = '';

    // Show loading message while waiting for Gemini
    output.textContent = 'Waiting for Gemini...';

    try {
        // Send the prompt to Gemini using the selected model
        const modelSelect = document.getElementById('modelSelect');
        const model = modelSelect ? modelSelect.value : 'gemini-4-31b';

        const data = await ai.models.generateContent({
            model,
            contents: prompt
        });

        // Display the response from Gemini
        output.textContent = data.text || 'No response from Gemini.';
    } catch (error) {
        // Display error message if something goes wrong
        output.textContent = 'Gemini request failed: ' + error.message;
    }
}

// Add event listener for the Enter button click
document.getElementById('enterButton').addEventListener('click', sendToGemini);

// Add event listener for the Enter key press in the input field
document.getElementById('input').addEventListener('keypress', function(event) {
    // Check if the pressed key is Enter
    if (event.key === 'Enter') {
        // Call sendToGemini when Enter is pressed
        sendToGemini();
    }
});