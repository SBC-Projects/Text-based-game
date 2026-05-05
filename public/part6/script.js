// Import the GoogleGenAI client for making requests to Gemini
import { GoogleGenAI } from './ai-client.js';

// Initialize the AI client
const ai = new GoogleGenAI({});

// Store previous chat messages when multichat is enabled
const chatHistory = [];

// Function to render all chat history entries to the page
function renderChatHistory() {
    // Get the chat history container element
    const chatHistoryDiv = document.getElementById('chatHistory');
    if (!chatHistoryDiv) return;

    // Convert each chat entry into an HTML div, then join them into a single string
    // The map function transforms each entry into HTML with appropriate styling
    chatHistoryDiv.innerHTML = chatHistory.map(entry => {
        // Determine CSS class based on whether this is a user or assistant message
        const roleClass = entry.role === 'user' ? 'chat-user' : 'chat-assistant';
        // Return an HTML string for this single chat entry
        return `<div class="chat-entry ${roleClass}"><strong>${entry.role}:</strong> ${entry.content}</div>`;
    }).join(''); // Join all entries into one string with no separator
}

// Helper function to parse JSON response from Gemini
function parseStoryJSON(responseText) {
    // Try to extract JSON from the response text
    // Sometimes the model returns markdown code blocks, so we handle that
    try {
        // First, try direct JSON parsing
        return JSON.parse(responseText);
    } catch (e) {
        // If that fails, look for JSON between markdown code blocks
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
        // If no markdown blocks, try to find raw JSON object
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            return JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
        }
        throw new Error('Could not parse JSON from response');
    }
}

// Function to render story elements from parsed JSON
function renderStory(storyData) {
    // Clear previous narration and choices
    const narrationDiv = document.getElementById('narration');
    const choicesDiv = document.getElementById('choices');
    narrationDiv.textContent = '';
    choicesDiv.innerHTML = '';

    // Display the story summary if provided
    if (storyData.summary) {
        const summaryDiv = document.getElementById('storySummary');
        summaryDiv.textContent = `Summary: ${storyData.summary}`;
    }

    // Display the narration/main story text
    if (storyData.narration) {
        narrationDiv.textContent = storyData.narration;
    }

    // Create buttons for each choice
    if (storyData.choices && Array.isArray(storyData.choices)) {
        storyData.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.className = 'choice-button';
            button.addEventListener('click', () => {
                // When user clicks a choice, treat it as their next input
                const input = document.getElementById('input');
                input.value = choice;
                sendToGemini();
            });
            choicesDiv.appendChild(button);
        });
    }
}

// Function to handle user input and send to Gemini
async function sendToGemini() {
    // Get references to the input field, output paragraph, and multichat toggle
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
        // Read model and prompt settings from the UI
        const modelSelect = document.getElementById('modelSelect');
        const model = modelSelect ? modelSelect.value : 'gemini-4-31b';

        const systemPromptSelect = document.getElementById('systemPromptSelect');
        const systemPrompt = systemPromptSelect ? systemPromptSelect.value : 'You are a helpful assistant.';

        const multichatToggle = document.getElementById('multichatToggle');
        const useMultichat = multichatToggle ? multichatToggle.checked : false;

        if (useMultichat) {
            chatHistory.push({ role: 'user', content: prompt });
        }

        // Build the content to send; include system prompt and previous exchange history in multichat mode
        let contentsToSend = prompt;
        if (useMultichat) {
            // Convert chat history into a formatted string for the AI to understand context
            // Map each entry to "User: message" or "Assistant: message" format
            const historyText = chatHistory.map(entry => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`).join('\n');
            // Prepend system prompt and history so the AI has full context
            contentsToSend = `${systemPrompt}\n\n${historyText}`;
        }

        const data = await ai.models.generateContent({
            model,
            contents: contentsToSend
        });

        const assistantReply = data.text || 'No response from Gemini.';
        // Try to parse the response as JSON (story data) or display as plain text
        try {
            // Attempt to parse Gemini response as JSON story format
            const storyData = parseStoryJSON(assistantReply);
            if (useMultichat) {
                // Store the original response in chat history
                chatHistory.push({ role: 'assistant', content: JSON.stringify(storyData) });
                renderChatHistory();
                output.textContent = '';
            }
            // Render the parsed story data (summary, narration, choices)
            renderStory(storyData);
        } catch (error) {
            // If JSON parsing fails, display the response as plain text
            output.textContent = 'Story format error: ' + error.message + '\n\nRaw response: ' + assistantReply;
        }
    } catch (error) {
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