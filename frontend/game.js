// *** Import function from other local scripts ***

import {
  defaultColor,
  defaultName,
  clientId,
  mobileCheck,
  splitKey,
  localSize,
} from "/frontend/utils.js";

import {
  paintGame,
  initPaint,
  colorPaletteDefault,
  backgroundColorsDefault,
} from "/frontend/graphic.js";

import { initNavigation } from "/frontend/navigation.js";
import { buildServer } from "/frontend/handlePackage.js";
const socket = buildServer();

// *** Global Variables Declaration ***

// ONE DAY MORE
sessionStorage.setItem(
  "paintSettings",
  JSON.stringify({
    colorPalette: colorPaletteDefault,
    backgroundColors: backgroundColorsDefault,
  })
);
// ONE DAY MORE

// *** Import element from the html document ***

const backCanvas = document.getElementById("backCanvas");
const frontCanvas = document.getElementById("frontCanvas");
const readyButton = document.getElementById("readyButton");

const controllerPlayer = document.getElementById("controllerPlayer");
const displayPlayer = document.getElementById("displayPlayer");
const upButton = document.getElementById("upButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const downButton = document.getElementById("downButton");

const controllerPlayerTwo = document.getElementById("controllerPlayerTwo");
const displayPlayerTwo = document.getElementById("displayPlayerTwo");
const upButtonTwo = document.getElementById("upButtonTwo");
const leftButtonTwo = document.getElementById("leftButtonTwo");
const rightButtonTwo = document.getElementById("rightButtonTwo");
const downButtonTwo = document.getElementById("downButtonTwo");

const roomCodeBox = document.getElementById("roomCodeBox");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const copyButton = document.getElementById("copyButton");

const playersDisplay = document.getElementById("playersDisplay");

// *** Event Listener ***

let keyController;

window.onload = (event) => {
  initNavigation(document);
  socket.emit("id", clientId());
  updateGame();
  updateReadyButton();
  updateControllers();
  keyController = JSON.parse(sessionStorage.getItem("keyController"));
};

window.addEventListener("store", handleStorage);

function handleStorage(event) {
  if (event.detail == "gameState") {
    updateGame();
  } else if (event.detail == "ready") {
    updateReadyButton();
  } else if (event.detail == "clientKey") {
    if (!sessionStorage.getItem("clientKey")) {
      location.pathname = "frontend/home.html";
    }
  } else if (event.detail == "playerController") {
    updateControllers();
  } else if (event.detail == "playerControllerTwo") {
    updateControllers();
  }
}

document.addEventListener("keydown", keydown);

readyButton.addEventListener("click", changeReady);

upButton.addEventListener("click", handleDirectionButton);
upButton.inputCode = "up";
leftButton.addEventListener("click", handleDirectionButton);
leftButton.inputCode = "left";
rightButton.addEventListener("click", handleDirectionButton);
rightButton.inputCode = "right";
downButton.addEventListener("click", handleDirectionButton);
downButton.inputCode = "down";

upButtonTwo.addEventListener("click", handleDirectionButton);
upButtonTwo.inputCode = "up";
upButtonTwo.playerTwo = true;
leftButtonTwo.addEventListener("click", handleDirectionButton);
leftButtonTwo.inputCode = "left";
leftButtonTwo.playerTwo = true;
rightButtonTwo.addEventListener("click", handleDirectionButton);
rightButtonTwo.inputCode = "right";
rightButtonTwo.playerTwo = true;
downButtonTwo.addEventListener("click", handleDirectionButton);
downButtonTwo.inputCode = "down";
downButtonTwo.playerTwo = true;

// *** Update Game Screen ***

function updateGame() {
  if (!sessionStorage.getItem("clientKey")) {
    location.pathname = "frontend/home.html";
    return;
  }
  if (!localSize()) {
    location.pathname = "frontend/players.html";
    return;
  }

  const gameState = JSON.parse(sessionStorage.getItem("gameState"));
  const paintSettings = JSON.parse(sessionStorage.getItem("paintSettings"));

  if (!gameState) {
    return;
  }
  if (gameState.event == "init") {
    initPaint(backCanvas, frontCanvas, gameState, paintSettings);
    readyButton.style.opacity = 1;
    readyButton.style.display = "block";
  }
  if (gameState.event == "start") {
    readyButton.style.opacity = -(gameState.time / gameState.frameRate) / 5;
  }
  if (gameState.time == 0) {
    readyButton.style.display = "none";
    sessionStorage.removeItem("ready");
    window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
  }
  if (gameState.event == "after") {
    readyButton.style.opacity = 1;
    readyButton.style.display = "block";
  }
  requestAnimationFrame(() => paintGame(gameState));
}

// *** Ready Button ***

function changeReady() {
  if (sessionStorage.getItem("ready")) {
    sessionStorage.removeItem("ready");
    window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
  } else {
    sessionStorage.setItem("ready", true);
    window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
  }
}

function updateReadyButton() {
  readyButton.classList.remove("button-red");
  readyButton.classList.remove("button-green");
  if (sessionStorage.getItem("ready")) {
    readyButton.classList.add("button-red");
    readyButton.innerText = "Wait!";
  } else {
    readyButton.classList.add("button-green");
    readyButton.innerText = "Start";
  }
  socket.emit("updateReady", sessionStorage.getItem("ready"));
}

// *** Controller ***

function updateControllers() {
  let localPlayers = sessionStorage.getItem("localPlayers");
  if (!localPlayers) {
    return;
  }
  localPlayers = JSON.parse(localPlayers);
  let playerController = sessionStorage.getItem("playerController");
  let playerControllerTwo = sessionStorage.getItem("playerControllerTwo");
  if (localPlayers[playerControllerTwo]) {
    displayPlayerTwo.innerHTML = localPlayers[playerControllerTwo].name;
    controllerPlayerTwo.style.opacity = 1;
  } else {
    controllerPlayerTwo.style.opacity = 0;
  }
  if (localPlayers[playerController]) {
    displayPlayer.innerHTML = localPlayers[playerController].name;
    controllerPlayer.style.opacity = 1;
  } else {
    controllerPlayer.style.opacity = 0;
  }
}

function handleDirectionButton(e) {
  let playerKey = e.target.playerTwo
    ? sessionStorage.getItem("playerControllerTwo")
    : sessionStorage.getItem("playerController");
  let controllerInput = { playerKey: playerKey, inputCode: e.target.inputCode };
  socket.emit("controllerInput", JSON.stringify(controllerInput));
}

function keydown(e) {
  let controllerInput = keyController[e.keyCode];
  if (!controllerInput) {
    return;
  }
  socket.emit("controllerInput", JSON.stringify(controllerInput));
}

// *** Players Display ***

function handlePlayers(players, readys) {
  let scores = Object.entries(players).map(([playerKey, player]) => {
    return [playerKey, player.score];
  });
  if (!scores.length) {
    return;
  }
  scores.sort((first, second) => {
    return second[1] - first[1];
  });
  let maxScore = scores[0][1];
  maxScore = maxScore ? maxScore : null;

  playersDisplay.replaceChildren();
  scores.forEach(([playerKey, score]) => {
    let player = players[playerKey];
    let playerDiv = display(
      player.admin,
      readys[playerKey],
      score == maxScore,
      player.color,
      player.name
    );
    playersDisplay.append(playerDiv);

    let keys = splitKey(playerKey);
    let localKey = keys[0] == clientKey ? keys[1] : null;
    if (playerController == localKey) {
      displayPlayer.replaceChildren();
      displayPlayer.append(playerDiv.cloneNode(true));
    }
    if (playerControllerTwo == localKey) {
      displayPlayerTwo.replaceChildren();
      displayPlayerTwo.append(playerDiv.cloneNode(true));
    }
  });
}

function display(admin, ready, score, color, name) {
  let playerDiv = document.createElement("div");
  let adminDiv = document.createElement("h2");
  let readyDiv = document.createElement("h2");
  let scoreDiv = document.createElement("h2");
  let colorDiv = document.createElement("input");
  let nameDiv = document.createElement("h2");

  playerDiv.classList.add("player");
  adminDiv.classList.add("admin");
  readyDiv.classList.add("ready");
  scoreDiv.classList.add("score");
  colorDiv.classList.add("color");
  colorDiv.setAttribute("type", "color");
  colorDiv.disabled = true;
  nameDiv.classList.add("name");

  adminDiv.innerHTML = admin ? "🛠️" : "";
  readyDiv.innerHTML = ready ? "✔️" : "";
  scoreDiv.innerHTML = score ? "👑" : "";
  colorDiv.value = color;
  nameDiv.innerHTML = name;

  if (admin !== "not show") {
    playerDiv.append(adminDiv);
  }
  if (ready !== "not show") {
    playerDiv.append(readyDiv);
  }
  if (score !== "not show") {
    playerDiv.append(scoreDiv);
  }
  if (color !== "not show") {
    playerDiv.append(colorDiv);
  }
  if (name !== "not show") {
    playerDiv.append(nameDiv);
  }
  return playerDiv;
}
