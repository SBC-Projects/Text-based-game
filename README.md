# Text-based-game

A very basic starter project for a browser-based, text-driven game.

This repository is designed as a simple base for building a "life-message" style text adventure. It includes a minimal HTML interface, a small JavaScript command parser, and room for others to expand the game logic, commands, and visuals.

## What is included

- `index.html` - game UI with a text input and output area.
- `style.css` - simple styling for the page.
- `script.js` - command handling and player behavior.
- `images/BananaWalk.gif` - example image used by one of the commands.

## Running the server

1. Copy `.env.example` to `.env`.
2. Set `GEMINI_API_KEY=your_gemini_api_key_here` in `.env`.
3. Make sure `.env` is listed in `.gitignore` so your API key does not get shared.
4. Run `npm install`.
5. Run `npm start`.
6. Open `http://localhost:3000` in your browser.


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
