# PLAN: My Game Portfolio

A GitHub Pages site at **https://jamesdaymccarthy.github.io** that shows off
all the games I make, so I can share them with friends.

## How it works

- `index.html` is the home page. `site.js` reads `games.json` and makes a card for every game.
- `games.json` is the list of games (the "table of contents"). The browser can't
  look inside folders, so every game **must** be listed here.
- Every game lives in its own folder: `games/<folder>/`
  - `index.html` is the game itself (what opens when you click the card)
  - `card.png` is the picture on the card (the name is always the same, so we
    don't need to write it in the JSON. That's "convention over configuration"!)
- Each visitor's browser remembers which games *they* played and ❤️'d, using
  `localStorage` (a little notebook the browser keeps for our site). My ⭐ picks
  are the `fave` field in `games.json`, and they're the same for everyone.
- No build step: the files in the repo are exactly what the website shows.

## A game's info in games.json

```json
{
  "title": "Puzzling",
  "folder": "puzzling",
  "blurb": "A complicated puzzle game! There's more than you see on the surface!",
  "fave": true,
  "date": "2026-10-05"
}
```

Dates are written `YYYY-MM-DD` (ISO 8601) so sorting them like words also sorts them by time.

## Steps

- [x] 1. Make the index file (home page)
- [x] 2. Add at least two games to the JSON (one fave, one not), using the `/add-game` skill
- [x] 3. Render the games as cards, newest first
- [x] 4. Favorites get a ⭐ on their card, plus a filter button to show only favorites
- [x] 5. GitHub setup: create the `jamesdaymccarthy.github.io` repo and turn on Pages
  (live at https://jamesdaymccarthy.github.io)
- [x] 6. Remember which games each visitor has played, and show "NEW!" on the ones they haven't
- [x] 7. Visitors can ❤️ their own favorites (separate from my ⭐ picks in `games.json`)

## To do later

- [x] **Growing Forest card:** done! Snakes battling under the trees.
- [x] **Wild Bunny label:** done! Added to the site on 2026-10-25.
- [ ] **Image Mashup card:** make a funny "strange abomination" and Print Screen it
  for the card. The site is public, so use animals, cartoons, or my own face,
  not a friend's photo without asking them.

## Tools

- `/add-game` is a Claude skill for adding or updating a game. It copies the files, asks
  me about the date, fave, and blurb, and makes the `card.png`.
- `python3 tools/check.py` is our **test**. It checks that `games.json` is correct and
  that every game has its folder, `index.html`, and `card.png`.
- `tools/card.sh` takes a screenshot of a game with Chrome to make a card picture.
- Preview the site locally: `python3 -m http.server` and open http://localhost:8000
