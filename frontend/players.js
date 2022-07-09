// *** Server-Client Initialisation ***

import { LOCALHOST } from "./_local.js";
let socketCORS = "https://snake-multi-psl.herokuapp.com/";
if (LOCALHOST) {
  socketCORS = "http://localhost:3000";
}

import { io } from "socket.io-client";
const socket = io(socketCORS, {
  withCredentials: true,
  extraHeaders: {
    "server-client": "yey-ca-marche",
  },
});

// *** FullScreen & Navigation ***

import { toggleFullScreen } from "./_fullscreen.js";

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

import { defaultColor, defaultName, mobileCheck, splitKey } from "./utils.js";

// *** Import element from the html document ***

const localPlayersStack = document.getElementById("localPlayers");
const remotePlayersStack = document.getElementById("remotePlayers");
// const colorInput = document.getElementById("colorInput");
// const nameInput = document.getElementById("nameInput");
// const useController = document.getElementById("useController");
// const errorMapKey = document.getElementById("errorMapKey");
// const controllerMap = document.getElementById("controllerMap");
// const upButtonMap = document.getElementById("upButtonMap");
// const leftButtonMap = document.getElementById("leftButtonMap");
// const rightButtonMap = document.getElementById("rightButtonMap");
// const downButtonMap = document.getElementById("downButtonMap");
// const setPlayerExit = document.getElementById("setPlayerExit");

// const settingsScreen = document.getElementById("settingsScreen");
// const exitSettingsButton = document.getElementById("exitSettingsButton");
// const localPlayersSettings = document.getElementById("localPlayersSettings");
// const newPlayerButton = document.getElementById("newLocalPlayerButton");
// const adminSettings = document.getElementById("adminSettings");
// const clientsSettings = document.getElementById("clientsSettings");
// const colorSettings = document.getElementById("colorSettings");
// const gameplaySettings = document.getElementById("gameplaySettings");
// const exitRoom = document.getElementById("exitRoom");

// // *** Event Listener ***

// // document.addEventListener("keydown", keydown);
// document.addEventListener("click", handleClick);

// // *** Server Listener ***

// colorInput.addEventListener("change", updateColor, false);
// nameInput.addEventListener("input", updateName);
// useController.addEventListener("click", handleUseController);
// upButtonMap.addEventListener("click", handleButtonMap);
// upButtonMap.inputCode = "up";
// leftButtonMap.addEventListener("click", handleButtonMap);
// leftButtonMap.inputCode = "left";
// rightButtonMap.addEventListener("click", handleButtonMap);
// rightButtonMap.inputCode = "right";
// downButtonMap.addEventListener("click", handleButtonMap);
// downButtonMap.inputCode = "down";
// setPlayerExit.addEventListener("click", handleSetPlayerExit);

// exitSettingsButton.addEventListener("click", handleExitSettingsButton);
// exitRoom.addEventListener("click", handleExitRoom);

// *** Global Variables Declaration ***

// let localPlayers = {};
// let localKeyCount = 0;
// let localSettings;
// let setPlayerKey;
// let setPlayer;
// let setPlayerControls;
// let playerController;
// let playerControllerTwo;
// let waitForKey;

// let ready = false;
// let clientKey;
// let keyController = {
//   37: { playerKey: 0, inputCode: "left" },
//   38: { playerKey: 0, inputCode: "up" },
//   39: { playerKey: 0, inputCode: "right" },
//   40: { playerKey: 0, inputCode: "down" },
//   81: { playerKey: 0, inputCode: "left" },
//   83: { playerKey: 0, inputCode: "down" },
//   68: { playerKey: 0, inputCode: "right" },
//   90: { playerKey: 0, inputCode: "up" },
// };

// // *** Transition from Title to Game ***

// function handleWellcomePackage(wellcomePackage) {
//   let unpack = JSON.parse(wellcomePackage);
//   roomCodeDisplay.innerText = unpack.roomCode;
//   handleSettings(unpack.settings);
//   clientKey = unpack.clientKey;
//   ready = false;
//   updateReadyButton();
//   sendUpdate();
//   if (!Object.keys(localPlayers).length) {
//     handleNewPlayer();
//     return;
//   }
//   showScreen(gameScreen);
// }

// function handleNewPlayer() {
//   initSetPlayerScreen();
//   showScreen(setPlayerScreen);
// }

// function handleSettings(settings) {
//   localSettings = settings;
//   // ONE DAY MORE
// }

// function sendUpdate() {
//   let updatePackage = {
//     players: localPlayers,
//     settings: localSettings,
//     ready: ready,
//   };
//   socket.emit("updatePackage", JSON.stringify(updatePackage));
// }

// // *** Set Player Screen ***

localPlayers["test"] = { name: "Jonon" };
remotePlayers["lol"] = { name: "Bruvs" };
updateStack();

function updateStack() {
  remotePlayersStack.replaceChildren();
  Object.keys(remotePlayers).forEach((playerKey) => {
    remotePlayersStack.append(remoteLine(playerKey));
  });
  let lastRemoteLine = document.createElement("li");
  lastRemoteLine.classList.add("new-player");
  let newremotePlayerButton = document.createElement("button");
  newremotePlayerButton.classList.add("button-green");
  newremotePlayerButton.innerText = "➕ New Remote Player";
  newremotePlayerButton.addEventListener("click", newRemotePlayer);
  lastRemoteLine.append(newremotePlayerButton);
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

function handleEditPlayer(e) {
  editPlayer(e.target.playerKey);
}

function handleRemovePlayer(e) {
  removePlayer(e.target.playerKey);
}

function editPlayer(playerKey) {
  console.log([playerKey, "editPlayer"]);
}

function removePlayer(playerKey) {
  console.log([playerKey, "editPlayer"]);
}

function newLocalPlayer() {
  console.log(["newLocalPlayer"]);
}
function newRemotePlayer() {
  console.log(["newRemotePlayer"]);
}
// function initSetPlayerScreen() {
//   if (localPlayers[setPlayerKey]) {
//     setPlayer = { ...localPlayers[setPlayerKey] };
//   } else {
//     localKeyCount++;
//     setPlayerKey = localKeyCount;
//     setPlayer = {
//       color: defaultColor(),
//       name: defaultName(),
//       score: 0,
//     };
//   }
//   colorInput.value = setPlayer.color;
//   nameInput.placeholder = setPlayer.name;
//   setPlayerControls = {
//     up: false,
//     left: false,
//     right: false,
//     down: false,
//   };
//   if (mobileCheck()) {
//     setPlayerControls = {
//       up: true,
//       left: true,
//       right: true,
//       down: true,
//     };
//     if (!Object.keys(localPlayers).length) {
//       controllerPlayer.style.display = "block";
//       playerController = setPlayerKey;
//     } else {
//       newPlayerButton.display = "none";
//       roomCodeBox.style.display = "none";
//       controllerPlayerTwo.style.display = "block";
//       playerControllerTwo = setPlayerKey;
//     }
//     useController.style.display = "none";
//     controllerMap.style.display = "none";
//   } else if (playerController) {
//     if (playerController === setPlayerKey) {
//       setPlayerControls = {
//         up: true,
//         left: true,
//         right: true,
//         down: true,
//       };
//       useController.style.display = "block";
//       controllerMap.style.display = "none";
//     } else {
//       initMapKey();
//       useController.style.display = "none";
//       controllerMap.style.display = "block";
//     }
//   } else {
//     initMapKey();
//     useController.style.display = "block";
//     controllerMap.style.display = "block";
//     updateUseControllerButton();
//   }
// }

// function initMapKey() {
//   let buttonsMap = [upButtonMap, leftButtonMap, rightButtonMap, downButtonMap];
//   buttonsMap.forEach((buttonMap) => {
//     buttonMap.classList.remove("map");
//     buttonMap.classList.add("mapping");
//     Object.entries(keyController).forEach(([keyCode, value]) => {
//       if (value.playerKey !== setPlayerKey) {
//         return;
//       }
//       if (value.inputCode === buttonMap.inputCode) {
//         buttonMap.classList.add("map");
//         buttonMap.classList.remove("mapping");
//         buttonMap.setAttribute("data-content", stringFromKeyCode(keyCode));
//         setPlayerControls[buttonMap.inputCode] = true;
//       }
//     });
//     if (setPlayerControls[buttonMap.inputCode]) {
//       return;
//     }
//     Object.entries(keyController).forEach(([keyCode, value]) => {
//       if (value.playerKey) {
//         return;
//       } // playerKey 0 is a default buffer
//       if (setPlayerControls[buttonMap.inputCode]) {
//         return;
//       }
//       if (value.inputCode === buttonMap.inputCode) {
//         value.playerKey = setPlayerKey;
//         buttonMap.classList.add("map");
//         buttonMap.classList.remove("mapping");
//         buttonMap.setAttribute("data-content", stringFromKeyCode(keyCode));
//         setPlayerControls[buttonMap.inputCode] = true;
//       }
//     });
//   });
// }

// function updateName(e) {
//   setPlayer.name = e.target.value;
// }
// function updateColor(e) {
//   setPlayer.color = e.target.value;
// }

// function handleSetPlayerExit() {
//   for (let inputCode in setPlayerControls) {
//     if (!setPlayerControls[inputCode]) {
//       errorMapKey.innerText = "No key as been registered for " + inputCode;
//       errorMapKey.style.display = "block";
//       return;
//     }
//   }
//   localPlayers[setPlayerKey] = { ...setPlayer };
//   sendUpdate();
//   buildSettings();
//   showScreen(settingsScreen);
// }

// function handleUseController() {
//   if (playerController === setPlayerKey) {
//     playerController = null;
//     controllerMap.style.display = "block";
//     controllerPlayer.style.display = "none";
//     setPlayerControls = {
//       up: false,
//       left: false,
//       right: false,
//       down: false,
//     };
//     initMapKey();
//   } else {
//     playerController = setPlayerKey;
//     setPlayerControls = {
//       up: true,
//       left: true,
//       right: true,
//       down: true,
//     };
//     controllerMap.style.display = "none";
//     controllerPlayer.style.display = "block";
//     Object.values(keyController).map((value) => {
//       if (value.playerKey === setPlayerKey) {
//         value.playerKey = 0;
//       }
//     });
//   }
//   updateUseControllerButton();
// }

// function updateUseControllerButton() {
//   if (playerController === setPlayerKey) {
//     useController.innerText = "🎹 Use Keyboard";
//   } else {
//     useController.innerText = "🖱️ Use Mouse";
//   }
// }

// function handleButtonMap(e) {
//   if (waitForKey) {
//     endMapKey();
//   }
//   errorMapKey.style.display = "none";
//   e.target.classList.add("mapping");
//   e.target.classList.remove("map");
//   waitForKey = e;
// }

// function handleClick(e) {
//   if (!waitForKey) {
//     return;
//   }
//   if (e.target.classList.contains("direction-button")) {
//     return;
//   }
//   endMapKey();
// }

// function endMapKey() {
//   waitForKey.target.classList.add("map");
//   waitForKey.target.classList.remove("mapping");
//   waitForKey = null;
// }

// function mapKey(keyCode) {
//   if (keyController[keyCode]) {
//     let keyUser = keyController[keyCode].playerKey;
//     if (keyUser) {
//       if (keyUser === setPlayerKey) {
//         errorMapKey.innerText = "You already use this key";
//       } else if (localPlayers[keyUser]) {
//         errorMapKey.innerText =
//           "Key already used by " + localPlayers[keyUser].name;
//       } else {
//         errorMapKey.innerText = "ERROR: Key used by an none player " + keyUser;
//       }
//       errorMapKey.style.display = "block";
//       endMapKey();
//       return;
//     }
//   }
//   Object.entries(keyController).forEach(([key, value]) => {
//     if (
//       value.playerKey === setPlayerKey &&
//       value.inputCode === waitForKey.target.inputCode
//     ) {
//       delete keyController[key];
//     }
//   });
//   keyController[keyCode] = {
//     playerKey: setPlayerKey,
//     inputCode: waitForKey.target.inputCode,
//   };
//   setPlayerControls[waitForKey.target.inputCode] = true;
//   waitForKey.target.setAttribute("data-content", stringFromKeyCode(keyCode));
//   endMapKey();
// }

// function stringFromKeyCode(keyCode) {
//   if (parseInt(keyCode) === 37) {
//     return "🠜";
//   }
//   if (parseInt(keyCode) === 38) {
//     return "🠝";
//   }
//   if (parseInt(keyCode) === 39) {
//     return "🠞";
//   }
//   if (parseInt(keyCode) === 40) {
//     return "🠟";
//   }
//   return String.fromCharCode(parseInt(keyCode));
// }

// // *** Settings Screen ***

// function handleSettingsButton() {
//   buildSettings();
//   showScreen(settingsScreen);
// }

// function handleExitSettingsButton() {
//   showScreen(gameScreen);
// }

// function buildSettings() {
//   localPlayersSettings.replaceChildren();
//   Object.entries(localPlayers).forEach(([playerKey, player]) => {
//     newLocalPlayerSettings(playerKey, player);
//   });

//   if (mobileCheck() && Object.keys(localPlayers).length > 1) {
//     newPlayerButton.style.display = "none";
//   } else {
//     newPlayerButton.style.display = "block";
//   }
// }

// function handleSetPlayerButton(e) {
//   initSetPlayerScreen(e.target.playerKey);
//   showScreen(setPlayerScreen);
// }

// function newLocalPlayerSettings(playerKey, player) {
//   let localDiv = document.createElement("div");
//   let setPlayerButton = document.createElement("button");
//   let removeLocalPlayer = document.createElement("button");
//   let playerDiv = display(
//     "not show",
//     "not show",
//     "not show",
//     player.color,
//     player.name
//   );

//   localDiv.playerKey = playerKey;
//   setPlayerButton.playerKey = playerKey;
//   removeLocalPlayer.playerKey = playerKey;

//   setPlayerButton.innerText = "✏️ Edit & 🕹️ Set Controls";
//   // setPlayerButton.addEventListener('click', handleSetPlayerButton);

//   removeLocalPlayer.innerText = "➖ Remove Local Player";
//   removeLocalPlayer.classList.add("redbutton");
//   removeLocalPlayer.addEventListener("click", updateRemoveLocalPlayer);

//   localDiv.append(playerDiv);
//   localDiv.append(setPlayerButton);
//   if (Object.keys(localPlayers).length > 1) {
//     localDiv.append(removeLocalPlayer);
//   }

//   localPlayersSettings.append(localDiv);
// }

// function updateRemoveLocalPlayer(e) {
//   if (!localPlayers[e.target.playerKey]) {
//     return;
//   }
//   delete localPlayers[e.target.playerKey];

//   if (playerControllerTwo === e.target.playerKey) {
//     playerControllerTwo = null;
//     roomCodeBox.style.display = "block";
//     controllerPlayerTwo.style.display = "none";
//   } else if (playerController === e.target.playerKey) {
//     if (playerControllerTwo) {
//       playerController = playerControllerTwo;
//       playerControllerTwo = null;
//       roomCodeBox.style.display = "block";
//       controllerPlayerTwo.style.display = "none";
//     } else {
//       playerController = null;
//       controllerPlayer.style.display = "none";
//     }
//   }
//   keyController = Object.fromEntries(
//     Object.entries(keyController).filter(([key, value]) => {
//       return value.playerKey !== e.target.playerKey;
//     })
//   );
//   buildSettings();
//   sendUpdate();
// }

// function handleExitRoom() {
//   socket.emit("exitRoom");
//   showScreen(titleScreen);
// }
