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

import { handleRoomPackage } from "/frontend/_handlePackage.js";
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

import { toggleFullScreen } from "/frontend/_fullscreen.js";

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

// *** Import utils ***

import {
  defaultColor,
  defaultName,
  clientId,
  mobileCheck,
  splitKey,
} from "/frontend/_utils.js";

// *** Import element from the html document ***

const localPlayersStack = document.getElementById("localPlayers");
const remotePlayersStack = document.getElementById("remotePlayers");

const sharePopup = document.getElementById("sharePopup");
const shareOverlay = document.getElementById("shareOverlay");
const doneShareButton = document.getElementById("doneShare");
const copyButton = document.getElementById("copyButton");

const editPopup = document.getElementById("editPopup");
const editOverlay = document.getElementById("editOverlay");

const colorInput = document.getElementById("colorInput");
const nameInput = document.getElementById("nameInput");

const useController = document.getElementById("useController");
const errorMapKey = document.getElementById("errorMapKey");
const controllerMap = document.getElementById("controllerMap");
const upButtonMap = document.getElementById("upButtonMap");
const leftButtonMap = document.getElementById("leftButtonMap");
const rightButtonMap = document.getElementById("rightButtonMap");
const downButtonMap = document.getElementById("downButtonMap");

const saveEditButton = document.getElementById("saveEdit");
const cancelEditButton = document.getElementById("cancelEdit");

// // *** Event Listener ***

copyButton.addEventListener("click", copyRoomCode);
doneShareButton.addEventListener("click", closeShare);
shareOverlay.addEventListener("click", closeShare);

saveEditButton.addEventListener("click", saveEdit);
cancelEditButton.addEventListener("click", exitEdit);
editOverlay.addEventListener("click", exitEdit);

colorInput.addEventListener("change", updateColor, false);
nameInput.addEventListener("input", updateName);

useController.addEventListener("click", handleUseController);
upButtonMap.addEventListener("click", handleButtonMap);
upButtonMap.inputCode = "up";
leftButtonMap.addEventListener("click", handleButtonMap);
leftButtonMap.inputCode = "left";
rightButtonMap.addEventListener("click", handleButtonMap);
rightButtonMap.inputCode = "right";
downButtonMap.addEventListener("click", handleButtonMap);
downButtonMap.inputCode = "down";

document.addEventListener("keydown", keydown);
document.addEventListener("click", handleClick);

// *** Global Variables Declaration ***

let localPlayers = {};
let remotePlayers = {};
let localKeyCount = 0;
let playerController;
let playerControllerTwo;
let keyController = {
  37: { playerKey: 0, inputCode: "left" },
  38: { playerKey: 0, inputCode: "up" },
  39: { playerKey: 0, inputCode: "right" },
  40: { playerKey: 0, inputCode: "down" },
  81: { playerKey: 0, inputCode: "left" },
  83: { playerKey: 0, inputCode: "down" },
  68: { playerKey: 0, inputCode: "right" },
  90: { playerKey: 0, inputCode: "up" },
};

let setPlayerKey;
let setPlayer;
let setPlayerControls;
let waitForKey = false;

// *** Initialisation ***

sessionStorage.setItem("localPlayers", JSON.stringify(localPlayers));
sessionStorage.setItem("remotePlayers", JSON.stringify(remotePlayers));
sessionStorage.setItem("playerController", JSON.stringify(playerController));
sessionStorage.setItem(
  "playerControllerTwo",
  JSON.stringify(playerControllerTwo)
);
sessionStorage.setItem("keyController", JSON.stringify(keyController));

window.onload = (event) => {
  socket.emit("id", clientId());
  updatePlayers();
};

// *** Update Players Lists ***

function checkVariables() {
  localPlayers = JSON.parse(sessionStorage.getItem("localPlayers"));
  remotePlayers = JSON.parse(sessionStorage.getItem("remotePlayers"));
  keyController = JSON.parse(sessionStorage.getItem("keyController"));
  localKeyCount = sessionStorage.getItem("localKeyCount");
  playerController = sessionStorage.getItem("playerController");
  playerControllerTwo = sessionStorage.getItem("playerControllerTwo");
  socket.emit("isLog");

  let keys = Object.keys(localPlayers);
  localKeyCount = Math.max(keys);
  sessionStorage.setItem("localKeyCount", localKeyCount);
  if (!keys.includes(playerControllerTwo)) {
    playerControllerTwo = null;
    sessionStorage.setItem("playerControllerTwo", playerControllerTwo);
  }
  if (!keys.includes(playerController)) {
    playerController = null;
    if (playerControllerTwo) {
      playerController = playerControllerTwo;
      playerControllerTwo = null;
      sessionStorage.setItem("playerControllerTwo", playerControllerTwo);
    }
    sessionStorage.setItem("playerController", playerController);
  }
  keys.push(0);
  keyController = Object.fromEntries(
    Object.entries(keyController).filter(([key, value]) => {
      return keys.includes(value.playerKey);
    })
  );
}

function updatePlayers() {
  checkVariables();
  remotePlayersStack.replaceChildren();
  Object.keys(remotePlayers).forEach((playerKey) => {
    remotePlayersStack.append(remoteLine(playerKey));
  });
  let lastRemoteLine = document.createElement("li");
  lastRemoteLine.classList.add("new-player");
  let newRemotePlayerButton = document.createElement("button");
  newRemotePlayerButton.classList.add("button-green");
  newRemotePlayerButton.innerText = "➕ New Remote Player";
  newRemotePlayerButton.addEventListener("click", newRemote);
  lastRemoteLine.append(newRemotePlayerButton);
  remotePlayersStack.append(lastRemoteLine);

  localPlayersStack.replaceChildren();
  Object.keys(localPlayers).forEach((playerKey) => {
    localPlayersStack.append(localLine(playerKey));
  });
  if (mobileCheck() && localPlayersStack.length > 1) {
    return;
  }
  let lastLine = document.createElement("li");
  lastLine.classList.add("new-player");
  let newLocalPlayerButton = document.createElement("button");
  newLocalPlayerButton.classList.add("button-green");
  newLocalPlayerButton.innerText = "➕ New Local Player";
  newLocalPlayerButton.addEventListener("click", newLocalPlayer);
  lastLine.append(newLocalPlayerButton);
  localPlayersStack.append(lastLine);
}

function localLine(playerKey) {
  let line = document.createElement("li");
  let nameTag = document.createElement("h3");
  let editButton = document.createElement("button");
  let removeButton = document.createElement("button");

  editButton.classList.add("button-green");
  removeButton.classList.add("button-red");

  nameTag.innerHTML = localPlayers[playerKey].name;
  editButton.innerText = "✏️ Edit";
  removeButton.innerText = "➖ Remove";

  line.playerKey = playerKey;
  editButton.playerKey = playerKey;
  removeButton.playerKey = playerKey;

  editButton.addEventListener("click", handleEditPlayer);
  removeButton.addEventListener("click", handleRemovePlayer);

  line.append(nameTag);
  line.append(editButton);
  line.append(removeButton);
  return line;
}

function remoteLine(playerKey) {
  let line = document.createElement("li");
  let nameTag = document.createElement("h3");
  nameTag.innerHTML = remotePlayers[playerKey].name;
  line.playerKey = playerKey;
  line.append(nameTag);
  return line;
}

// *** Share Screen ***

function newRemote() {
  if (sessionStorage.getItem("isLog") && sessionStorage.getItem("roomCode")) {
    roomCodeDisplay.innerText = sessionStorage.getItem("roomCode");
    sharePopup.classList.add("active");
    shareOverlay.classList.add("active");
    return;
  }
  window.location.pathname = "frontend/index.html";
}

function copyRoomCode() {
  let roomCode = sessionStorage.getItem("roomCode");
  let copyText = `https://psl.institute/frontend/index.html?r=${roomCode}&\n\n\
    Wesh bruv! Come play, it no the same without you\n\
    My room code is: ${roomCode}`;
  navigator.clipboard.writeText(copyText);
}

function closeShare() {
  sharePopup.classList.remove("active");
  shareOverlay.classList.remove("active");
}

// *** Remove Players ***

function handleRemovePlayer(e) {
  removePlayer(e.target.playerKey);
}

function removePlayer(playerKey) {
  if (!localPlayers[playerKey]) {
    return;
  }
  delete localPlayers[playerKey];

  if (playerControllerTwo === playerKey) {
    playerControllerTwo = null;
  } else if (playerController === playerKey) {
    if (playerControllerTwo) {
      playerController = playerControllerTwo;
      playerControllerTwo = null;
    } else {
      playerController = null;
    }
  }
  keyController = Object.fromEntries(
    Object.entries(keyController).filter(([key, value]) => {
      return value.playerKey !== playerKey;
    })
  );
  sessionStorage.setItem("localPlayers", JSON.stringify(localPlayers));
  socket.emit("updatePlayers", JSON.stringify(localPlayers));
  sessionStorage.setItem("keyController", JSON.stringify(keyController));
  sessionStorage.setItem("playerController", playerController);
  sessionStorage.setItem("playerControllerTwo", playerControllerTwo);
  updatePlayers();
}

// *** Add Players ***

function newLocalPlayer() {
  localKeyCount++;
  setPlayerKey = localKeyCount;
  setPlayer = {
    color: defaultColor(),
    name: defaultName(),
    score: 0,
  };
  editPlayer();
}

// *** Edit Player ***

function handleEditPlayer(e) {
  setPlayerKey = e.target.playerKey;
  setPlayer = { ...localPlayers[setPlayerKey] };
  editPlayer();
}

function editPlayer() {
  colorInput.value = setPlayer.color;
  nameInput.placeholder = setPlayer.name;
  setPlayerControls = {
    up: false,
    left: false,
    right: false,
    down: false,
  };
  if (mobileCheck()) {
    setPlayerControls = {
      up: true,
      left: true,
      right: true,
      down: true,
    };
    if (!Object.keys(localPlayers).length) {
      controllerPlayer.style.display = "block";
      playerController = setPlayerKey;
    } else {
      newPlayerButton.display = "none";
      roomCodeBox.style.display = "none";
      controllerPlayerTwo.style.display = "block";
      playerControllerTwo = setPlayerKey;
    }
    useController.style.display = "none";
    controllerMap.style.display = "none";
  } else if (playerController) {
    if (playerController === setPlayerKey) {
      setPlayerControls = {
        up: true,
        left: true,
        right: true,
        down: true,
      };
      useController.style.display = "block";
      controllerMap.style.display = "none";
    } else {
      initMapKey();
      useController.style.display = "none";
      controllerMap.style.display = "block";
    }
  } else {
    initMapKey();
    useController.style.display = "block";
    controllerMap.style.display = "block";
    updateUseControllerButton();
  }
  editPopup.classList.add("active");
  editOverlay.classList.add("active");
}

function updateName(e) {
  setPlayer.name = e.target.value;
}
function updateColor(e) {
  setPlayer.color = e.target.value;
}

function saveEdit() {
  for (let inputCode in setPlayerControls) {
    if (!setPlayerControls[inputCode]) {
      errorMapKey.innerText = "No key as been registered for " + inputCode;
      errorMapKey.style.display = "block";
      return;
    }
  }
  localPlayers[setPlayerKey] = { ...setPlayer };

  sessionStorage.setItem("localPlayers", JSON.stringify(localPlayers));
  socket.emit("updatePlayers", JSON.stringify(localPlayers));
  sessionStorage.setItem("keyController", JSON.stringify(keyController));
  sessionStorage.setItem("localKeyCount", localKeyCount);
  sessionStorage.setItem("playerController", playerController);
  sessionStorage.setItem("playerControllerTwo", playerControllerTwo);
  exitEdit();
}

function exitEdit() {
  updatePlayers();
  editPopup.classList.remove("active");
  editOverlay.classList.remove("active");
}

// *** Use Controller ***

function handleUseController() {
  if (playerController === setPlayerKey) {
    playerController = null;
    controllerMap.style.display = "block";
    controllerPlayer.style.display = "none";
    setPlayerControls = {
      up: false,
      left: false,
      right: false,
      down: false,
    };
    initMapKey();
  } else {
    playerController = setPlayerKey;
    setPlayerControls = {
      up: true,
      left: true,
      right: true,
      down: true,
    };
    controllerMap.style.display = "none";
    controllerPlayer.style.display = "block";
    Object.values(keyController).map((value) => {
      if (value.playerKey === setPlayerKey) {
        value.playerKey = 0;
      }
    });
  }
  updateUseControllerButton();
}

function updateUseControllerButton() {
  if (playerController === setPlayerKey) {
    useController.innerText = "🎹 Use Keyboard";
  } else {
    useController.innerText = "🖱️ Use Mouse";
  }
}

// *** Map Key ***

function initMapKey() {
  let buttonsMap = [upButtonMap, leftButtonMap, rightButtonMap, downButtonMap];
  buttonsMap.forEach((buttonMap) => {
    buttonMap.classList.remove("map");
    buttonMap.classList.add("mapping");
    Object.entries(keyController).forEach(([keyCode, value]) => {
      if (value.playerKey !== setPlayerKey) {
        return;
      }
      if (value.inputCode === buttonMap.inputCode) {
        buttonMap.classList.add("map");
        buttonMap.classList.remove("mapping");
        buttonMap.setAttribute("data-content", stringFromKeyCode(keyCode));
        setPlayerControls[buttonMap.inputCode] = true;
      }
    });
    if (setPlayerControls[buttonMap.inputCode]) {
      return;
    }
    Object.entries(keyController).forEach(([keyCode, value]) => {
      if (value.playerKey) {
        return;
      } // playerKey 0 is a default buffer
      if (setPlayerControls[buttonMap.inputCode]) {
        return;
      }
      if (value.inputCode === buttonMap.inputCode) {
        value.playerKey = setPlayerKey;
        buttonMap.classList.add("map");
        buttonMap.classList.remove("mapping");
        buttonMap.setAttribute("data-content", stringFromKeyCode(keyCode));
        setPlayerControls[buttonMap.inputCode] = true;
      }
    });
  });
}

function keydown(e) {
  if (waitForKey) {
    mapKey(e.keyCode);
    return;
  }
  let controllerInput = keyController[e.keyCode];
  if (!controllerInput) {
    return;
  }
}

function handleButtonMap(e) {
  if (waitForKey) {
    endMapKey();
  }
  errorMapKey.style.display = "none";
  e.target.classList.add("mapping");
  e.target.classList.remove("map");
  waitForKey = e;
}

function handleClick(e) {
  if (!waitForKey) {
    return;
  }
  if (e.target.classList.contains("direction-button")) {
    return;
  }
  endMapKey();
}

function endMapKey() {
  waitForKey.target.classList.add("map");
  waitForKey.target.classList.remove("mapping");
  waitForKey = null;
}

function mapKey(keyCode) {
  if (keyController[keyCode]) {
    let keyUser = keyController[keyCode].playerKey;
    if (keyUser) {
      if (keyUser === setPlayerKey) {
        errorMapKey.innerText = "You already use this key";
      } else if (localPlayers[keyUser]) {
        errorMapKey.innerText =
          "Key already used by " + localPlayers[keyUser].name;
      } else {
        errorMapKey.innerText = "ERROR: Key used by an none player " + keyUser;
      }
      errorMapKey.style.display = "block";
      endMapKey();
      return;
    }
  }
  Object.entries(keyController).forEach(([key, value]) => {
    if (
      value.playerKey === setPlayerKey &&
      value.inputCode === waitForKey.target.inputCode
    ) {
      delete keyController[key];
    }
  });
  keyController[keyCode] = {
    playerKey: setPlayerKey,
    inputCode: waitForKey.target.inputCode,
  };
  setPlayerControls[waitForKey.target.inputCode] = true;
  waitForKey.target.setAttribute("data-content", stringFromKeyCode(keyCode));
  endMapKey();
}

function stringFromKeyCode(keyCode) {
  if (parseInt(keyCode) === 37) {
    return "🠜";
  }
  if (parseInt(keyCode) === 38) {
    return "🠝";
  }
  if (parseInt(keyCode) === 39) {
    return "🠞";
  }
  if (parseInt(keyCode) === 40) {
    return "🠟";
  }
  return String.fromCharCode(parseInt(keyCode));
}
