// Import the analyseInput function from our analysis module
import { analyseInput } from './analyse-input.js';
// Import the Player class from our player module
import { Player } from './player.js';

// Create a new player instance at the start of the game
const player = new Player();

// Function to handle user input: analyze it and display the result
function displayInput() {
    // Get references to the input field and output paragraph
    const input = document.getElementById('input');
    const output = document.getElementById('output');

    // Analyze the user's input using our analysis function, passing the player object
    const result = analyseInput(input.value, player);

    // Display the result in the output paragraph
    output.textContent = result;

    // Clear the input field after processing
    input.value = '';
}

// Add event listener for the Enter button click
document.getElementById('enterButton').addEventListener('click', displayInput);

// Add event listener for the Enter key press in the input field
document.getElementById('input').addEventListener('keypress', function(event) {
    // Check if the pressed key is Enter
    if (event.key === 'Enter') {
        // Call displayInput when Enter is pressed
        displayInput();
    }
});