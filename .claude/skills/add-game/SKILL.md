---
name: add-game
description: Add a new game to the portfolio site, or update one that's already there. Copies the game files into games/<folder>/, asks the kid about the date, favorite status and blurb, makes card.png, updates games.json, and runs the check. Use whenever the user wants to add, publish, post or update a game.
---

# Add (or update) a game

The user is a nine-year-old. Keep it friendly and short, and ask **one or two
questions at a time**. Read `PLAN.md` if you need a reminder of how the site works.

Every game ends up as:

```
games/<folder>/index.html   ← the game (opens when the card is clicked)
games/<folder>/card.png     ← 640x400 picture for the card
games/<folder>/...          ← any other files the game needs
```

plus one entry in `games.json`:

```json
{ "title": "...", "folder": "...", "blurb": "...", "fave": false, "date": "YYYY-MM-DD" }
```

## 1. New game or update?

Look at `games.json`. If the game is already there, this is an **update**:
replace the game's files but keep its entry. Ask if anything on the card should
change (blurb? fave? new picture?). Keep the `date` (it's the *first* release
date) unless the user asks to change it. Before overwriting, show which files
will be replaced or removed.

## 2. Get the game files

Ask where the game is. It might be:

- **A folder or file on the computer.** **Move** it (`mv`, not `cp`) into `games/<folder>/` so the Downloads folder stays clean. If the
  main HTML file isn't called `index.html`, rename it (and fix any links to it).
- **A claude.ai artifact or chat.** Claude Code usually can't open the user's
  claude.ai chats. Ask them to use the artifact's **Download** button (or copy
  the code into a file) and tell you where it saved, usually `~/Downloads`. If
  they paste a `claude.ai/artifact/...` link, try the Artifact tool's `read` action first.
  Single-file HTML games just become `index.html`. If the game is React/JSX (not
  plain HTML), it needs a small HTML wrapper that loads React and Babel from
  cdnjs. Make that, then test it.
- **Khan Academy (Processing.js).** Have them paste the code into a file. Wrap
  it in an `index.html` that loads Processing.js 1.4.8 from cdnjs and runs the code inside
  `new Processing(canvas, function(processingInstance) { with (processingInstance) { size(400, 400); frameRate(30); /* code */ } })`.
  Khan Academy's `getImage(...)` and `getSound(...)` won't work outside Khan Academy.
  If the code uses them, say so and help find a fix.
- **Scratch.** Best option: they download the `.sb3` (File → Save to your
  computer), then go to https://packager.turbowarp.org, load it, choose
  "Plain HTML", and package it. The resulting `.html` becomes `index.html`.
  Walk them through it step by step.
- **PICO-8.** In PICO-8, load the cart and type `export <name>.html`. That
  makes `<name>.html` and `<name>.js`. Copy both, and rename the `.html` to
  `index.html` (the `.js` keeps its name). For the card, press **F6** while the
  game is running to save a screenshot (or **F7** to capture the cart label),
  Screenshots go to the desktop folder (usually `~/Desktop`).
- **TIC-80.** Use `export html <name>` in TIC-80 (it makes a `.zip`). Unzip it into
  the folder. It should already have an `index.html`.

Pick the folder name: lowercase-with-dashes, made from the title
(`Super Space Dodge` → `super-space-dodge`). Confirm it with the user. It
becomes part of the web address and shouldn't change later.

## 3. Ask about the card info

- **Title.** Suggest one from the game and confirm it.
- **Date.** "When did you release (finish) this game?" If they don't know,
  suggest a guess from file dates (`ls -l --time-style=long-iso`) and let
  them choose. Format: `YYYY-MM-DD`.
- **Favorite?** Yes or no. Is it one of their best?
- **Blurb.** Ask what the game is about and what's fun or special about it.
  Then offer 2–3 short blurb ideas (one or two sentences, in *their* voice,
  exciting but true) and let them pick or change one. Their own words win.

## 4. Make card.png (640x400)

Try these in order. After making a card, **look at it with the Read tool**
before showing it, and ask the user if they like it.

1. **The user's own screenshot.** This is often the best one, because they
   can pick an exciting moment. On this computer (GNOME), pressing **Print
   Screen** lets them select an area, and the picture is saved in
   `~/Pictures/Screenshots/`. PICO-8's F6 also works. **Move** it to
   `card.png`. If it isn't exactly 16:10, that's OK: the page crops the middle
   with `object-fit: cover`. (A PNG is required. Convert other formats with Chrome
   by putting the image on a 640x400 scratchpad page and using `card.sh`.)
2. **A screenshot of the game:**
   `tools/card.sh games/<folder>/index.html games/<folder>/card.png 4 ['#go']`
   - The number is how many seconds the game runs first.
   - The optional last argument is a CSS selector for a button to click first,
     to get past a start screen. Find it by searching the game's HTML for the
     start button (for example `id="go"`, `id="start"`, or a `<button>` with
     "Play" or "Start" in it). If the buttons have no ids (often because
     JavaScript built them), pick one by position instead, like
     `'.modes button:nth-child(3)'`.
   - A game's title screen can make a great card too. Compare both before choosing.
   - If the game is small and sits in the middle of lots of empty space, set
     a smaller pretend screen so it fills the card: `CARD_WIDTH=720 tools/card.sh ...`
     (default 1280; Mystery Box used 720). Some games resize themselves to fit
     the window, so zooming can make them *smaller*. Compare before choosing.
   - If instructions or a title push the game down the page, scroll to it
     first: `CARD_SCROLL=canvas tools/card.sh ...` (any CSS selector; Gravity
     Golf used `CARD_WIDTH=720 CARD_SCROLL=canvas` plus `'#startBtn'`).
   - To press keys first (turn off fog, switch to 3D, start the game...),
     list them: `CARD_KEYS="f" tools/card.sh ...` (names are JavaScript's
     `e.key` names, like `f`, `Enter`, `ArrowRight`, separated by spaces).
     Search the game's `keydown` code to see which keys do what.
   - Games that wait for a key press, or that need time to "grow"
     (like Growing Forest), usually don't look good this way. Use option 1 or 3.
3. **A title card made from the game's own art.** Write a small HTML page in
   the scratchpad: 640x400, `body { margin: 0 }`, with the game's sprites or
   images (or its colors, drawn shapes, or a fitting emoji) and the title in a
   fun font. Screenshot it with `tools/card.sh <that page> games/<folder>/card.png 2`.

## 5. Update games.json

Add (or update) the entry. Keep the file in date order, oldest first, with one
game per line so it's easy to read. If two games have the same date, the one
lower in the file counts as newer, so ask which came first.

## 6. Test it

- Run `python3 tools/check.py`. It must say ✓. If it finds problems, fix them
  (ask the kid what they think the error message means first!).
- Remind them they can preview the site by running `python3 -m http.server` in the repo
  and opening http://localhost:8000. Click the new card and make sure the game
  plays.

## 7. Commit

Suggest a commit with a clear message, like `Add Space Dodge` or
`Update Puzzling: new levels`. **Always ask before `git push`.** Pushing is
what publishes it to the real website.
