// Builds the home page: reads games.json and makes one card per game.

let allGames = [];
let filter = "all";  // "all", "picks", "hearts" or "new"

// ---- Remembering things in this visitor's browser ----
// localStorage is a little notebook the browser keeps for our website. It
// only stores text, so we turn our lists into JSON text to save them.
// Each visitor has their own notebook, so it remembers *their* games.
// (Some browsers block it, like in private windows, so we use try/catch.)

function loadList(name) {
  try {
    return new Set(JSON.parse(localStorage.getItem(name)) ?? []);
  } catch {
    return new Set();
  }
}

function saveList(name, set) {
  try {
    localStorage.setItem(name, JSON.stringify([...set]));
  } catch {
    // Can't save. That's OK, the page still works.
  }
}

let played = loadList("played");  // folders of games this visitor has opened
let hearts = loadList("hearts");  // folders of games this visitor ❤️'d

// "2026-10-05" -> "October 5, 2026"
// We say timeZone "UTC" because JavaScript reads "2026-10-05" as midnight in
// London. Without it, in America it would show up as October 4!
function prettyDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

// Make the HTML element for one game's card.
function makeCard(game) {
  const card = document.createElement("div");
  card.className = "card";
  if (game.fave) card.classList.add("fave");

  const link = document.createElement("a");
  link.className = "card-link";
  link.href = `games/${game.folder}/`;
  // When someone opens the game, write it in their notebook.
  const remember = () => { played.add(game.folder); saveList("played", played); };
  link.addEventListener("click", remember);
  link.addEventListener("auxclick", remember);  // middle-click opens a new tab
  card.append(link);

  const img = document.createElement("img");
  img.src = `games/${game.folder}/card.png`;
  img.alt = "";
  img.loading = "lazy";
  link.append(img);

  if (!played.has(game.folder)) {
    const badge = document.createElement("span");
    badge.className = "new-badge";
    badge.textContent = "NEW!";
    badge.title = "You haven't played this one yet";
    link.append(badge);
  }

  const title = document.createElement("h2");
  title.textContent = game.title;
  if (game.fave) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "⭐";
    star.title = "One of James' favorites!";
    title.append(star);
  }
  link.append(title);

  const date = document.createElement("p");
  date.className = "date";
  date.textContent = prettyDate(game.date);
  link.append(date);

  const blurb = document.createElement("p");
  blurb.className = "blurb";
  blurb.textContent = game.blurb;
  link.append(blurb);

  const heart = document.createElement("button");
  const hearted = hearts.has(game.folder);
  heart.className = "heart";
  heart.textContent = hearted ? "❤️" : "🤍";
  heart.title = hearted ? "Remove from your favorites" : "Add to your favorites";
  heart.setAttribute("aria-pressed", hearted);
  heart.onclick = () => {
    if (hearts.has(game.folder)) hearts.delete(game.folder);
    else hearts.add(game.folder);
    saveList("hearts", hearts);
    render();
  };
  card.append(heart);

  return card;
}

// Which games does each filter button show?
const filters = {
  all: game => true,
  picks: game => game.fave,
  hearts: game => hearts.has(game.folder),
  new: game => !played.has(game.folder),
};

const emptyMessages = {
  all: "No games here yet. Coming soon!",
  picks: "James hasn't picked any favorites yet.",
  hearts: "Click the 🤍 on a game to add it to your favorites!",
  new: "Wow, you've played every game! 🎉",
};

// Draw the cards that match the filter into the page.
function render() {
  const games = allGames.filter(filters[filter]);
  const cards = document.getElementById("cards");
  if (games.length === 0) {
    cards.innerHTML = `<p class="empty">${emptyMessages[filter]}</p>`;
  } else {
    cards.replaceChildren(...games.map(makeCard));
  }
  for (const button of document.querySelectorAll(".filters button")) {
    button.classList.toggle("active", button.dataset.filter === filter);
  }
}

for (const button of document.querySelectorAll(".filters button")) {
  button.onclick = () => { filter = button.dataset.filter; render(); };
}

// When you press Back after playing a game, the browser may show the old page
// from memory. Re-read the notebook so the NEW! badge goes away.
addEventListener("pageshow", event => {
  if (!event.persisted) return;  // a normal page load, nothing to do
  played = loadList("played");
  hearts = loadList("hearts");
  render();
});

fetch("games.json")
  .then(response => response.json())
  .then(games => {
    // Newest first. Dates are "YYYY-MM-DD", so comparing them as text works!
    // games.json is oldest first, so we reverse it first: then if two games
    // have the same date, the one lower in the file counts as newer.
    allGames = games.reverse().sort((a, b) => b.date.localeCompare(a.date));
    render();
  })
  .catch(error => {
    document.getElementById("cards").innerHTML =
      `<p class="empty">Oops, couldn't load games.json: ${error}</p>`;
  });
