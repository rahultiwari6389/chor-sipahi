// =========================
// CONSTANTS
// =========================

const ROLES = ["Raja", "Mantri", "Sipahi", "Chor"];

const POINTS = {
  Raja: 1000,
  Mantri: 800,
  Sipahi: 500,
  Chor: 0,
};

// =========================
// GAME STATE
// =========================

let round = 1;

let players = [];

let scores = [0, 0, 0, 0];

let cards = [];

let assignedRoles = [];

let currentPlayer = 0;

let rajaIndex = -1;
let sipahiIndex = -1;
let chorIndex = -1;
let mantriIndex = -1;

// =========================
// INIT
// =========================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startGameBtn").addEventListener("click", startGame);

  document.getElementById("nextRoundBtn").addEventListener("click", nextRound);
});

// =========================
// HELPERS
// =========================

function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function getRoleIcon(role) {
  switch (role) {
    case "Raja":
      return "👑";

    case "Sipahi":
      return "🛡️";

    case "Mantri":
      return "📜";

    case "Chor":
      return "🕵️";

    default:
      return "🎴";
  }
}

// =========================
// START GAME
// =========================

async function startGame() {
  players = [
    document.getElementById("player1").value || "Player 1",
    document.getElementById("player2").value || "Player 2",
    document.getElementById("player3").value || "Player 3",
    document.getElementById("player4").value || "Player 4",
  ];

  document.getElementById("setupScreen").classList.add("hidden");

  document.getElementById("gameScreen").classList.remove("hidden");

  updatePlayers();

  await nextRound();
}

// =========================
// PLAYER UI
// =========================

function updatePlayers() {
  players.forEach((name, index) => {
    document.getElementById(`playerName${index}`).textContent = name;

    document.getElementById(`playerScore${index}`).textContent =
      `${scores[index]} pts`;
  });
}

function updateRanks() {
  const ranking = scores
    .map((score, index) => ({
      index,
      score,
    }))
    .sort((a, b) => b.score - a.score);

  ranking.forEach((player, position) => {
    const rankElement = document.getElementById(`playerRank${player.index}`);

    rankElement.className = "player-rank rank-" + (position + 1);

    rankElement.textContent = getOrdinal(position + 1);
  });

  document
    .querySelectorAll(".player-card")
    .forEach((card) => card.classList.remove("leader"));

  document
    .getElementById(`playerCard${ranking[0].index}`)
    .classList.add("leader");
}

function getOrdinal(num) {
  switch (num) {
    case 1:
      return "🥇 1st";

    case 2:
      return "🥈 2nd";

    case 3:
      return "🥉 3rd";

    default:
      return "4th";
  }
}
// =========================
// ROUND
// =========================

async function nextRound() {
  assignedRoles = [];

  currentPlayer = 0;

  cards = shuffle(ROLES).map((role) => ({
    role,
    taken: false,
  }));

  document.getElementById("resultSection").classList.add("hidden");

  document.getElementById("nextRoundBtn").classList.add("hidden");

  document.getElementById("cardsBoard").classList.remove("hidden");

  document.querySelectorAll(".player-role").forEach((el) => {
    el.textContent = "❔";
  });

  document.getElementById("roundNumber").textContent = round;

  createBoard();

  await Swal.fire({
    title: "🎴 Shuffling Cards",
    text: "Preparing roles...",
    timer: 1500,
    showConfirmButton: false,
  });

  updateTurnMessage();
}

// =========================
// BOARD
// =========================

function createBoard() {
  const board = document.getElementById("cardsBoard");

  board.innerHTML = "";

  cards.forEach((card, index) => {
    const div = document.createElement("div");

    div.className = "game-card";

    div.textContent = "🎴";

    div.dataset.index = index;

    div.addEventListener("click", () => pickCard(index));

    board.appendChild(div);
  });
}

// =========================
// TURN
// =========================

function updateTurnMessage() {
  document.getElementById("turnMessage").textContent =
    `${players[currentPlayer]} - Choose a Card`;
}

// =========================
// PICK CARD
// =========================

async function pickCard(cardIndex) {
  if (currentPlayer >= 4) return;

  const card = cards[cardIndex];

  if (!card || card.taken) return;

  card.taken = true;

  assignedRoles[currentPlayer] = card.role;

  document.querySelectorAll(".game-card")[cardIndex].classList.add("used");

  await Swal.fire({
    title: players[currentPlayer],
    html: `
            <div style="font-size:100px">
                ${getRoleIcon(card.role)}
            </div>
            <h2>${card.role}</h2>
        `,
    confirmButtonText: "I Have Seen My Card",
    allowOutsideClick: false,
  });

  currentPlayer++;

  if (currentPlayer < 4) {
    await Swal.fire({
      title: "📱 Pass Tablet",
      html: `
                Give tablet to
                <br><br>
                <b>${players[currentPlayer]}</b>
            `,
      confirmButtonText: "Ready",
      allowOutsideClick: false,
    });

    updateTurnMessage();
  } else {
    revealRoles();
  }
}

// =========================
// REVEAL
// =========================

function revealRoles() {
  rajaIndex = assignedRoles.indexOf("Raja");

  sipahiIndex = assignedRoles.indexOf("Sipahi");

  chorIndex = assignedRoles.indexOf("Chor");

  mantriIndex = assignedRoles.indexOf("Mantri");

  document.getElementById(`playerRole${rajaIndex}`).textContent = "👑";

  document.getElementById(`playerRole${sipahiIndex}`).textContent = "🛡️";

  document.getElementById("cardsBoard").innerHTML = "";

  document.getElementById("turnMessage").textContent = "";

  document.getElementById("cardsBoard").classList.add("hidden");

  document.getElementById("rajaAnnouncement").classList.remove("hidden");

  showGuessButtons();
}

// =========================
// GUESS
// =========================

function showGuessButtons() {
  const section = document.getElementById("guessSection");

  const buttons = document.getElementById("guessButtons");

  buttons.innerHTML = "";

  [mantriIndex, chorIndex].forEach((index) => {
    const btn = document.createElement("button");

    btn.textContent = players[index];

    btn.addEventListener("click", () => makeGuess(index));

    buttons.appendChild(btn);
  });

  section.classList.remove("hidden");
}

// =========================
// GUESS RESULT
// =========================

async function makeGuess(index) {
  document.getElementById("cardsBoard").classList.add("hidden");

  let finalRoles = [...assignedRoles];

  if (index === chorIndex) {
    await Swal.fire({
      icon: "success",
      title: "🎉 Chor Caught!",
    });
  } else {
    await Swal.fire({
      icon: "error",
      title: "❌ Wrong Guess!",
    });

    finalRoles[sipahiIndex] = "Chor";

    finalRoles[chorIndex] = "Sipahi";
  }

  finalRoles.forEach((role, playerIndex) => {
    scores[playerIndex] += POINTS[role];
  });

  updatePlayers();
  updateRanks();

  showRoundResult(finalRoles);
}

// =========================
// RESULT
// =========================

function showRoundResult(finalRoles) {
  document.getElementById("rajaAnnouncement").classList.add("hidden");

  document.getElementById("guessSection").classList.add("hidden");

  const result = document.getElementById("resultContent");

  result.innerHTML = `
        <h2>Round Results</h2>
        <br>

        ${players[0]} - ${finalRoles[0]}<br>
        ${players[1]} - ${finalRoles[1]}<br>
        ${players[2]} - ${finalRoles[2]}<br>
        ${players[3]} - ${finalRoles[3]}
    `;

  document.getElementById("resultSection").classList.remove("hidden");

  document.getElementById("nextRoundBtn").classList.remove("hidden");

  round++;
}
