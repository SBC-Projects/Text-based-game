import { analyseInput } from './analyse-input.js';

function displayInput() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const result = analyseInput(input.value);
    output.textContent = result;
    input.value = ''; // Clear the input after displaying
}

document.getElementById('enterButton').addEventListener('click', displayInput);

document.getElementById('input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        displayInput();
    }
});