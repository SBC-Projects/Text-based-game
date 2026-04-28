# Text-based-game

A very basic starter project for a browser-based, text-driven game.

This repository is designed as a simple base for building a "life-message" style text adventure. It includes a minimal HTML interface, a small JavaScript command parser, and room for others to expand the game logic, commands, and visuals.

## What is included

- `index.html` - game UI with a text input and output area.
- `style.css` - simple styling for the page.
- `script.js` - command handling and player behavior.
- `images/BananaWalk.gif` - example image used by one of the commands.

## How to use

1. Open `index.html` in a web browser.
2. Type one of the built-in commands into the text area.
3. Press Enter or click the button to run the command.

## Built-in commands

- `show mushroom` — displays a mushroom message.
- `show banana` — shows the banana walking image.
- `greet` — the player says hello.
- `math x y` — multiplies two numbers and displays the result.
- `do things` — updates player state and shows the bag contents.

## Good ways to build on this

- Add more commands and richer story text.
- Create a full game state with rooms, inventory, and events.
- Replace the command parser with a more flexible text interpreter.
- Add sound, animations, or character dialogue.
- Turn this into a life-message game where user input changes the world over time.

## How to share

Other people can clone this repo and use it as a foundation:

```bash
git clone https://github.com/SBC-Projects/Text-based-game.git
```

They can then modify the HTML, CSS, and JavaScript to build their own version.
