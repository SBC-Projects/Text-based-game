function displayInput() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    output.textContent = input.value;
    input.value = ''; // Clear the input after displaying
}

document.getElementById('enterButton').addEventListener('click', displayInput);

document.getElementById('input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        displayInput();
    }
});