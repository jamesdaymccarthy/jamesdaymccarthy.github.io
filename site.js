// Builds the home page: reads games.json and makes one card per game.

let allGames = [];
let favesOnly = false;

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
  const card = document.createElement("a");
  card.className = game.fave ? "card fave" : "card";
  card.href = `games/${game.folder}/`;

  const img = document.createElement("img");
  img.src = `games/${game.folder}/card.png`;
  img.alt = "";
  img.loading = "lazy";
  card.append(img);

  const title = document.createElement("h2");
  title.textContent = game.title;
  if (game.fave) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "⭐";
    star.title = "One of my favorites!";
    title.append(star);
  }
  card.append(title);

  const date = document.createElement("p");
  date.className = "date";
  date.textContent = prettyDate(game.date);
  card.append(date);

  const blurb = document.createElement("p");
  blurb.className = "blurb";
  blurb.textContent = game.blurb;
  card.append(blurb);

  return card;
}

// Draw all the cards (or just the favorites) into the page.
function render() {
  const games = favesOnly ? allGames.filter(game => game.fave) : allGames;
  const cards = document.getElementById("cards");
  if (games.length === 0) {
    cards.innerHTML = `<p class="empty">No games here yet. Coming soon!</p>`;
  } else {
    cards.replaceChildren(...games.map(makeCard));
  }
  document.getElementById("show-all").classList.toggle("active", !favesOnly);
  document.getElementById("show-faves").classList.toggle("active", favesOnly);
}

document.getElementById("show-all").onclick = () => { favesOnly = false; render(); };
document.getElementById("show-faves").onclick = () => { favesOnly = true; render(); };

fetch("games.json")
  .then(response => response.json())
  .then(games => {
    // Newest first. Dates are "YYYY-MM-DD", so comparing them as text works!
    allGames = games.sort((a, b) => b.date.localeCompare(a.date));
    render();
  })
  .catch(error => {
    document.getElementById("cards").innerHTML =
      `<p class="empty">Oops, couldn't load games.json: ${error}</p>`;
  });
