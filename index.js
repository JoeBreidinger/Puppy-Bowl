/**
 * @typedef Player
 * @property {number} id
 * @property {string} name
 * @property {string} breed
 * @property {string} status // "bench" (default) or "field" (if currently playing)
 * @property {string} imageUrl
 * @property {number} teamId // isEqual to null when not on team
 */

// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2508-PUPPIES";
const ENDPOINT = "/players";
const API = BASE + COHORT + ENDPOINT;

// === State ===
let players = [];
let selectedPlayer;

/** updates the state with all current puppies from the API*/
async function getPlayers() {
  try {
    const response = await fetch(API);
    const result = await response.json();
    players = result.data.players;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** get a selected a puppy by updating state with single puppy from API*/
async function getPlayer(id) {
  try {
    const response = await fetch(API + "/" + id);
    const result = await response.json();
    selectedPlayer = result.data.player;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

function PlayerListItem(player) {
  const $li = document.createElement("li");
  $li.innerHTML = `
  <a href="#selected">${player.name}</a>
  `;
  $li.addEventListener("click", () => getPlayer(player.id));
  return $li;
}

/** A list of the names of all puppies */
function PlayerList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("lineup");

  const $players = players.map(PlayerListItem);
  $ul.replaceChildren(...$players);

  return $ul;
}

/** Information about selected puppy */
function SelectedPlayer() {
  if (!selectedPlayer) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a player to see stats...";
    return $p;
  }

  const player = document.createElement("section");
  player.innerHTML = `
        <h3>Name: ${selectedPlayer.name} | ID: ${selectedPlayer.id}</h3>
        <figure>
            <img alt=${selectedPlayer.name} src=${selectedPlayer.imageUrl} height = 360rem />
        </figure>
        <p>Team: ${selectedPlayer.teamId}</p>
        <p>Breed: ${selectedPlayer.breed}</p>
        <p>Status: ${selectedPlayer.status}</p>
        <button>Remove Player</button>
        `;

  const $delete = player.querySelector("button");
  $delete.addEventListener("click", () => deletePlayer(selectedPlayer.id));

  return player;
}

/** Allows user to add new puppy players */
function NewPlayerForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>
    <label>
      Breed
      <input name="breed" required />
    </label>
    <label>
      Status
      <select name="status">
        <option value="bench">Bench</option>
        <option value="field">Field</option>
      </select>
    </label>
    <label>
      Image URL
      <input name="imageUrl" />
    </label>
    <button>Invite Player</button>
    `;
  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData($form);
    addPlayer({
      name: data.get("name"),
      breed: data.get("breed"),
      status: data.get("status"),
      imageUrl: data.get("imageUrl"),
    });
  });
  return $form;
}

/** Creates new player via the API */
async function addPlayer(player) {
  try {
    await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(player),
    });
    getPlayers();
  } catch (e) {
    console.error(e);
  }
}

/** Deletes the player with given ID via the API */
async function deletePlayer(id) {
  try {
    await fetch(API + "/" + id, {
      method: "DELETE",
    });
    selectedPlayer = undefined;
    getPlayers();
  } catch (e) {
    console.error(e);
  }
}

// === Render ===

function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>PUPPY BOWL</h1>
    <main>
      <section>
        <h2>Puppy Contestants</h2>
        <PlayerList></PlayerList>
        <h3>Add a new Player</h3>
        <NewPlayerForm></NewPlayerForm>
      </section>
      <section id="selected">
        <h2>Puppy Details</h2>
        <SelectedPuppy></SelectedPuppy>
      </section>
    </main>
  `;

  $app.querySelector("PlayerList").replaceWith(PlayerList());
  $app.querySelector("NewPlayerForm").replaceWith(NewPlayerForm());
  $app.querySelector("SelectedPuppy").replaceWith(SelectedPlayer());
}

async function init() {
  await getPlayers();
  render();
}

init();
