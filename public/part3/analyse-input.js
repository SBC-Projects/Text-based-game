// analyse-input.js - Module for analyzing user input and generating responses

// Main function to analyze user input and return an appropriate response
// Now takes a player object as a parameter to interact with the player state
export function analyseInput(input, player) {
  // Check if input is empty or null
  if (!input) {
    return 'Please enter a command.';
  }

  // Convert input to lowercase for case-insensitive matching
  const normalized = input.toLowerCase();

  // Check for specific commands and return appropriate responses
  if (normalized.includes('show mushroom')) {
    // User wants to see a mushroom
    return 'You see a mushroom! 🍄';
  } else if (normalized.includes('show banana')) {
    // User wants to see a banana
    return 'You see a banana! 🍌';
  } else if (normalized === 'hello') {
    // Simple greeting command - uses player's greet method
    return player.greet();
  } else if (normalized === 'bag') {
    // BAG COMMAND: Show what's in the player's bag
    return `Your bag contains: ${player.bag.join(', ')}`;
  }
  // TODO: Add an 'equip' command handler that uses the player's equipWeapon() method
  // TODO: Add a 'status' command handler that displays player information (uses stats method)
  // TODO: Add a 'level-up' command handler that uses the levelUp() method
  // TODO: Add an 'add item' command handler that uses the addToInventory() method
  // TODO: Add a 'damage' command handler that uses the takeDamage() method
  else {
    // Default case: echo back the user's input
    return input;
  }
}
