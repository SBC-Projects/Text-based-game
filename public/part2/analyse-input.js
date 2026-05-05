export function analyseInput(input) {
  if (!input) {
    return 'Please enter a command.';
  }

  const normalized = input.toLowerCase();

  if (normalized.includes('show mushroom')) {
    return 'You see a mushroom! 🍄';
  } else if (normalized.includes('show banana')) {
    return 'You see a banana! 🍌';
  } else if (normalized === 'hello') {
    return 'Hello there!';
  } else {
    return input;
  }
}
