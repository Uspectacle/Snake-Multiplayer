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

import { initFullScreen } from "/frontend/fullscreen.js";
import { buildServer } from "/frontend/handlePackage.js";
const socket = buildServer();

// *** Global Variables Declaration ***

let localPlayers;
let remotePlayers;
let keyController;
let localKeyCount;
let playerController;
let playerControllerTwo;

let setPlayerKey;
let setPlayer;
let setPlayerControls;
let waitForKey = false;

const defaultKey = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  81: "left",
  83: "down",
  68: "right",
  90: "up",
};

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

const readyButton = document.getElementById("readyButton");

// *** Event Listener ***

window.onload = (event) => {
  sessionStorage.removeItem("ready");
  window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
  initFullScreen(document);
  socket.emit("id", clientId());
  updatePlayers();
};

window.addEventListener("store", handleStorage);

function handleStorage(event) {
  if (event.detail == "remotePlayers") {
    updatePlayers();
  } else if (event.detail == "clientKey") {
    if (!sessionStorage.getItem("clientKey")) {
      closeShare();
      updateReadyButton();
    }
  } else if (event.detail == "localPlayers") {
    updatePlayers();
  }
}

document.addEventListener("keydown", keydown);
document.addEventListener("click", handleClick);

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

readyButton.addEventListener("click", handleReadyButton);

// *** Update Players Lists ***

function updatePlayers() {
  checkVariables();
  buildRemotePlayersStack();
  buildLocalPlayersStack();
  updateReadyButton();
}

function checkVariables() {
  localPlayers = JSON.parse(sessionStorage.getItem("localPlayers")) || {};
  remotePlayers = JSON.parse(sessionStorage.getItem("remotePlayers")) || {};
  console.log("checkVariables", {
    keyController,
    sessionStorage: JSON.parse(sessionStorage.getItem("keyController")),
  });
  keyController = JSON.parse(sessionStorage.getItem("keyController")) || {};
  localKeyCount = sessionStorage.getItem("localKeyCount") || 0;
  playerController = sessionStorage.getItem("playerController");
  playerControllerTwo = sessionStorage.getItem("playerControllerTwo");

  let keys = Object.keys(localPlayers);
  console.log({ keys });
  localKeyCount = Math.max(keys);
  sessionStorage.setItem("localKeyCount", localKeyCount);
  window.dispatchEvent(new CustomEvent("store", { detail: "localKeyCount" }));
  if (!keys.includes(`${playerControllerTwo}`)) {
    playerControllerTwo = null;
    sessionStorage.removeItem("playerControllerTwo");
    window.dispatchEvent(
      new CustomEvent("store", { detail: "playerControllerTwo" })
    );
  }
  if (!keys.includes(`${playerController}`)) {
    playerController = null;
    sessionStorage.removeItem("playerController");
    window.dispatchEvent(
      new CustomEvent("store", { detail: "playerController" })
    );
    if (playerControllerTwo) {
      playerController = playerControllerTwo;
      playerControllerTwo = null;
      sessionStorage.removeItem("playerControllerTwo");
      window.dispatchEvent(
        new CustomEvent("store", { detail: "playerControllerTwo" })
      );
      sessionStorage.setItem("playerController", playerController);
      window.dispatchEvent(
        new CustomEvent("store", { detail: "playerController" })
      );
    }
  }
  keys.push("0");
  console.log({ keys });
  console.log("checked 1", keyController);
  keyController = Object.fromEntries(
    Object.entries(keyController).filter(([key, value]) => {
      console.log({
        bool: keys.includes(`${value.playerKey}`),
        playerKey: value.playerKey,
      });
      return keys.includes(`${value.playerKey}`);
    })
  );
  console.log("checked 2", keyController);
  Object.entries(defaultKey).forEach(([key, inputCode]) => {
    if (!keyController[key]) {
      keyController[key] = { playerKey: 0, inputCode: inputCode };
    }
  });
  console.log("checked 3", keyController);
}

function buildRemotePlayersStack() {
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
}

function remoteLine(playerKey) {
  let line = document.createElement("li");
  let nameTag = document.createElement("h3");
  nameTag.innerHTML = remotePlayers[playerKey].name;
  line.playerKey = playerKey;
  line.append(nameTag);
  return line;
}

function buildLocalPlayersStack() {
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

// *** Ready Button ***

function updateReadyButton() {
  readyButton.classList.remove("button-green");
  readyButton.classList.remove("button-red");
  if (!localSize()) {
    readyButton.classList.add("button-red");
    readyButton.innerHTML = "No Local Player !";
    return;
  }
  readyButton.classList.add("button-green");
  readyButton.innerHTML = sessionStorage.getItem("clientKey")
    ? "Start"
    : "Join Room";
}

function handleReadyButton() {
  if (readyButton.innerHTML == "Start") {
    sessionStorage.setItem("ready", true);
    window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
    window.location.pathname = "frontend/game.html";
  } else if (readyButton.innerHTML == "Join Room") {
    window.location.pathname = "frontend/index.html";
  }
}

// *** Share Screen ***

function newRemote() {
  if (
    sessionStorage.getItem("clientKey") &&
    sessionStorage.getItem("roomCode")
  ) {
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

  if (playerControllerTwo == playerKey) {
    playerControllerTwo = null;
  } else if (playerController == playerKey) {
    if (playerControllerTwo) {
      playerController = playerControllerTwo;
      playerControllerTwo = null;
    } else {
      playerController = null;
    }
  }
  console.log("removePlayer before", keyController);
  keyController = Object.fromEntries(
    Object.entries(keyController).filter(([key, value]) => {
      return value.playerKey !== playerKey;
    })
  );
  console.log("removePlayer after", keyController);

  sessionStorage.setItem("localPlayers", JSON.stringify(localPlayers));
  window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
  socket.emit("updatePlayers", JSON.stringify(localPlayers));
  sessionStorage.setItem("keyController", JSON.stringify(keyController));
  window.dispatchEvent(new CustomEvent("store", { detail: "keyController" }));
  if (playerController) {
    sessionStorage.setItem("playerController", playerController);
    window.dispatchEvent(
      new CustomEvent("store", { detail: "playerController" })
    );
  } else {
    sessionStorage.removeItem("playerController");
    window.dispatchEvent(
      new CustomEvent("store", { detail: "playerController" })
    );
  }
  if (playerControllerTwo) {
    sessionStorage.setItem("playerControllerTwo", playerControllerTwo);
    window.dispatchEvent(
      new CustomEvent("store", { detail: "playerControllerTwo" })
    );
  } else {
    sessionStorage.removeItem("playerControllerTwo");
    window.dispatchEvent(
      new CustomEvent("store", { detail: "playerControllerTwo" })
    );
  }
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
  Object.values(keyController).map((value) => {
    if (value.playerKey == setPlayerKey) {
      value.playerKey = 0;
    }
  });
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
    if (playerController == setPlayerKey) {
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
  sessionStorage.setItem("keyController", JSON.stringify(keyController));
  sessionStorage.setItem("localKeyCount", localKeyCount);
  if (playerController) {
    sessionStorage.setItem("playerController", playerController);
  } else {
    sessionStorage.removeItem("playerController");
  }
  if (playerControllerTwo) {
    sessionStorage.setItem("playerControllerTwo", playerControllerTwo);
  } else {
    sessionStorage.removeItem("playerControllerTwo");
  }
  window.dispatchEvent(new CustomEvent("store", { detail: "localPlayers" }));
  window.dispatchEvent(new CustomEvent("store", { detail: "keyController" }));
  window.dispatchEvent(new CustomEvent("store", { detail: "localKeyCount" }));
  window.dispatchEvent(
    new CustomEvent("store", { detail: "playerController" })
  );
  window.dispatchEvent(
    new CustomEvent("store", { detail: "playerControllerTwo" })
  );
  socket.emit("updatePlayers", JSON.stringify(localPlayers));
  exitEdit();
}

function exitEdit() {
  updatePlayers();
  editPopup.classList.remove("active");
  editOverlay.classList.remove("active");
}

// *** Use Controller ***

function handleUseController() {
  if (playerController == setPlayerKey) {
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
  }
  updateUseControllerButton();
}

function updateUseControllerButton() {
  if (playerController == setPlayerKey) {
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
      if (value.playerKey != 0) {
        return;
      }
      if (setPlayerControls[buttonMap.inputCode]) {
        return;
      }
      if (value.inputCode == buttonMap.inputCode) {
        value.playerKey = setPlayerKey;
        buttonMap.classList.add("map");
        buttonMap.classList.remove("mapping");
        buttonMap.setAttribute("data-content", stringFromKeyCode(keyCode));
        setPlayerControls[buttonMap.inputCode] = true;
      }
    });
    console.log("initMapKey : keyController", keyController);
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
  if (setPlayerControls[waitForKey.target.inputCode]) {
    waitForKey.target.classList.add("map");
    waitForKey.target.classList.remove("mapping");
  } else {
    waitForKey.target.classList.add("mapping");
    waitForKey.target.classList.remove("map");
  }
  waitForKey = null;
}

function mapKey(keyCode) {
  if (keyController[keyCode]) {
    let keyUser = keyController[keyCode].playerKey;
    if (keyUser != 0) {
      if (keyUser == setPlayerKey) {
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
      value.playerKey == setPlayerKey &&
      value.inputCode == waitForKey.target.inputCode
    ) {
      console.log("keyController[key]", key);
      delete keyController[key];
    }
  });
  console.log("mapKey", {
    keyCode,
    setPlayerKey,
    inputCode: waitForKey.target.inputCode,
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
  if (parseInt(keyCode) == 37) {
    return "🠜";
  }
  if (parseInt(keyCode) == 38) {
    return "🠝";
  }
  if (parseInt(keyCode) == 39) {
    return "🠞";
  }
  if (parseInt(keyCode) == 40) {
    return "🠟";
  }
  return String.fromCharCode(parseInt(keyCode));
}
