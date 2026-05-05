// player.js - Player class for the game

// ============ DEVELOPER CHALLENGES ============
// Challenge 1: Add a 'level' variable to the Player class constructor.
//              Initialize it to 1. Increase it when the player completes tasks.
//
// Challenge 2: Add an 'equipped' boolean variable to the Player class.
//              Create an equipWeapon(weaponName) method that sets 'equipped' to true
//              and returns a message like "You equipped a [weaponName]!"
//
// Challenge 3: Add an 'inventory' array (like 'bag') and create an addToInventory(item)
//              method that adds items to the inventory and returns a confirmation.
//
// Challenge 4: Create a 'stats()' method that returns a string with the player's
//              current statistics (name, level, health, weapon, etc.).
//
// Challenge 5: Add a 'takeDamage(amount)' method that decreases health points
//              and returns a message. If health reaches 0, return "Game Over!"
// ============================================

export class Player {
  constructor() {
    this.name = 'Bob'; // Player's name
    this.healthPoints = 3; // Player's health
    // TODO: CHALLENGE 1 - Add a 'level' variable, initialize to 1
    // TODO: CHALLENGE 2 - Add a 'weapon' variable and an 'equipped' boolean
    // TODO: CHALLENGE 3 - Add an 'inventory' array for additional items
    this.bag = ['map', 'torch']; // Items player is carrying
  }

  // Basic greeting method
  greet() {
    return 'Hello!';
  }

  // Simple math method
  doMaths(a, b) {
    return a * b;
  }

  // Method that modifies player state
  doThings() {
    this.name += 's';
    this.healthPoints += 1;
    return this.bag.join(', ');
  }

  // TODO: CHALLENGE 2 - Write an equipWeapon(weaponName) method
  //       that sets this.weapon and this.equipped to true,
  //       then returns a message like "You equipped a [weaponName]!"

  // TODO: CHALLENGE 1 - Write a levelUp() method that increases the player's level

  // TODO: CHALLENGE 3 - Write an addToInventory(item) method
  //       that adds an item to the inventory array and returns a confirmation message

  // TODO: CHALLENGE 4 - Write a stats() method that returns a formatted string
  //       showing the player's name, health, level, weapon, and other stats

  // TODO: CHALLENGE 5 - Write a takeDamage(amount) method that decreases healthPoints
  //       by the given amount. Return a message, and if health reaches 0, return "Game Over!"
}
