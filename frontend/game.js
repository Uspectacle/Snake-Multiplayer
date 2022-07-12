// *** Server-Client Initialisation ***

let socketCORS = "https://snake-multi-psl.herokuapp.com/";
let baseHref = "https://uspectacle.github.io/Snake-Multiplayer";
if (window.location.hostname == "127.0.0.1:5500") {
  socketCORS = "http://localhost:3000";
  baseHref = "";
}

import { io } from "socket.io-client";
const socket = io(socketCORS, {
  withCredentials: true,
  extraHeaders: {
    "server-client": "yey-ca-marche",
  },
});

import { handleRoomPackage } from baseHref+"/frontend/_handlePackage.js";
socket.on("roomPackage", handleRoomPackage);

socket.on("isLog", handleIsLog);

function handleIsLog(isLog) {
  if (isLog) {
    sessionStorage.setItem("isLog", true);
  } else {
    sessionStorage.removeItem("isLog");
  }
}
// *** FullScreen & Navigation ***

import { toggleFullScreen } from baseHref+"/frontend/_fullscreen.js";

const fullScreen = document.getElementById("fullScreen");
fullScreen.addEventListener("click", haddleFullScreen);
function haddleFullScreen() {
  toggleFullScreen(document);
}

let openBtn = document.getElementById("nav-open");
let closeBtn = document.getElementById("nav-close");
let navWrapper = document.getElementById("nav-wrapper");
let navLatteral = document.getElementById("nav-latteral");

const openNav = () => {
  navWrapper.classList.add("active");
  navLatteral.style.left = "0";
};

const closeNav = () => {
  navWrapper.classList.remove("active");
  navLatteral.style.left = "-100%";
};

openBtn.addEventListener("click", openNav);
closeBtn.addEventListener("click", closeNav);
navWrapper.addEventListener("click", closeNav);

// *** Import function from other local scripts ***

import {
  defaultColor,
  defaultName,
  clientId,
  mobileCheck,
  splitKey,
} from baseHref+"/frontend/_utils.js";

import {
  paintGame,
  initPaint,
  colorPaletteDefault,
  backgroundColorsDefault,
} from baseHref+"/frontend/_graphic.js";

// *** Import element from the html document ***

// * Game Screen *
const gameScreen = document.getElementById("gameScreen");

// * Game Screen : Controller Player Two *
const controllerPlayerTwo = document.getElementById("controllerPlayerTwo");
const displayPlayerTwo = document.getElementById("displayPlayerTwo");
const upButtonTwo = document.getElementById("upButtonTwo");
const leftButtonTwo = document.getElementById("leftButtonTwo");
const rightButtonTwo = document.getElementById("rightButtonTwo");
const downButtonTwo = document.getElementById("downButtonTwo");

// * Game Screen : Room Code Box *
const roomCodeBox = document.getElementById("roomCodeBox");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const copyButton = document.getElementById("copyButton");

// * Game Screen : Players Display *
const playersDisplay = document.getElementById("playersDisplay");

// * Game Screen : Game *
const backCanvas = document.getElementById("backCanvas");
const frontCanvas = document.getElementById("frontCanvas");
const readyButton = document.getElementById("readyButton");

// * Game Screen : Settings *
const settingsButton = document.getElementById("settingsButton");

// * Game Screen : Controller *
const controllerPlayer = document.getElementById("controllerPlayer");
const displayPlayer = document.getElementById("displayPlayer");
const upButton = document.getElementById("upButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const downButton = document.getElementById("downButton");

// *** Event Listener ***
// * Game Screen : Controller Player Two *
upButtonTwo.addEventListener("click", handleDirectionButton);
upButton.inputCode = "up";
upButton.playerTwo = true;
leftButtonTwo.addEventListener("click", handleDirectionButton);
leftButtonTwo.inputCode = "left";
leftButtonTwo.playerTwo = true;
rightButtonTwo.addEventListener("click", handleDirectionButton);
rightButtonTwo.inputCode = "right";
rightButtonTwo.playerTwo = true;
downButtonTwo.addEventListener("click", handleDirectionButton);
downButtonTwo.inputCode = "down";
downButtonTwo.playerTwo = true;

// *** Initialisation ***
window.onload = (event) => {
  socket.emit("id", clientId());
};

// * Game Screen : Room Code Box *
// copyButton.addEventListener("click", copyRoomCode);
// newPlayerButton.addEventListener("click", handleNewPlayer);

// * Game Screen : Game *
readyButton.addEventListener("click", updateReady);

// * Game Screen : Settings *
// settingsButton.addEventListener("click", handleSettingsButton);

// * Game Screen : Controller *
upButton.addEventListener("click", handleDirectionButton);
upButton.inputCode = "up";
leftButton.addEventListener("click", handleDirectionButton);
leftButton.inputCode = "left";
rightButton.addEventListener("click", handleDirectionButton);
rightButton.inputCode = "right";
downButton.addEventListener("click", handleDirectionButton);
downButton.inputCode = "down";

// *** Server Listener ***
socket.on("onlyGameState", handleOnlyGameState);

// *** Game Screen ***

function handleOnlyGameState(gameState) {
  handleGameState(JSON.parse(gameState));
}

// *** Game Screen : Ready Button ***

function updateReady() {
  ready = !ready;
  updateReadyButton();
  sendUpdate();
}

function updateReadyButton() {
  if (ready) {
    readyButton.classList.add("redbutton");
    readyButton.innerText = "I'm NOT Ready";
  } else {
    readyButton.classList.remove("redbutton");
    readyButton.innerText = "I'm Ready";
  }
}

// * Game Screen : Game State *

function handleGameState(gameState) {
  if (gameState.event === "init") {
    let paintSettings = {
      colorPalette: colorPaletteDefault,
      backgroundColors: backgroundColorsDefault,
    };
    initPaint(backCanvas, frontCanvas, gameState, paintSettings);
    readyButton.style.opacity = 1;
    readyButton.style.display = "block";
  }
  if (gameState.event === "start") {
    readyButton.style.opacity = -(gameState.time / gameState.frameRate) / 5;
  }
  if (gameState.time === 0) {
    readyButton.style.display = "none";
    ready = false;
    updateReadyButton();
  }
  if (gameState.event === "after") {
    readyButton.style.opacity = 1;
    readyButton.style.display = "block";
  }
  requestAnimationFrame(() => paintGame(gameState));
}

// * Game Screen : Controller *

function keydown(e) {
  if (waitForKey) {
    mapKey(e.keyCode);
    return;
  }
  let controllerInput = keyController[e.keyCode];
  if (!controllerInput) {
    return;
  }
  socket.emit("controllerInput", JSON.stringify(controllerInput));
}

function handleDirectionButton(e) {
  let playerKey = e.target.playerTwo ? playerControllerTwo : playerController;
  let controllerInput = { playerKey: playerKey, inputCode: e.target.inputCode };
  socket.emit("controllerInput", JSON.stringify(controllerInput));
}

// *** Game Screen : Players Display ***

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
      score === maxScore,
      player.color,
      player.name
    );
    playersDisplay.append(playerDiv);

    let keys = splitKey(playerKey);
    let localKey = keys[0] === clientKey ? keys[1] : null;
    if (playerController === localKey) {
      displayPlayer.replaceChildren();
      displayPlayer.append(playerDiv.cloneNode(true));
    }
    if (playerControllerTwo === localKey) {
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
