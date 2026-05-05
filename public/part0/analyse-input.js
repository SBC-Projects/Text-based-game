import { updateOutput, appendBananaImage } from './ui.js';

export function analyseInput(input, player) {
  if (!input) {
    updateOutput('Please enter a command.');
    return;
  }

  const normalized = input.toLowerCase();

  if (normalized.includes('show mushroom')) {
    showMushroom();
  } else if (normalized.includes('show banana')) {
    showBanana();
  } else if (normalized === 'greet') {
    updateOutput(player.greet());
  } else if (normalized.startsWith('math ')) {
    const parts = input.split(' ');
    if (parts.length === 3) {
      const a = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      if (!isNaN(a) && !isNaN(b)) {
        updateOutput(player.doMaths(a, b));
      } else {
        updateOutput('Invalid numbers');
      }
    } else {
      updateOutput('Use math with two numbers, e.g. math 2 3');
    }
  } else if (normalized === 'do things') {
    updateOutput(player.doThings());
  } else {
    updateOutput(input);
  }
}

function showMushroom() {
  updateOutput('You see a mushroom! 🍄');
}

function showBanana() {
  appendBananaImage();
}
