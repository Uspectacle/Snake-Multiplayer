// *** Server-Client Initialisation ***

import { LOCALHOST } from './local.js';
let socketCORS = "https://snake-multi-psl.herokuapp.com/";
if (LOCALHOST) {
    socketCORS = "http://localhost:3000";
}

import { io } from "socket.io-client";
const socket = io(socketCORS, {
    withCredentials: true,
    extraHeaders: {
      "server-client": "yey-ca-marche"
    }
});



// *** Import function from other local scripts ***

import { 
    defaultColor, 
    defaultName,
    mobileCheck,
    splitKey,
} from './utils.js';

import { 
    paintGame, 
    initPaint, 
    colorPaletteDefault, 
    backgroundColorsDefault, 
} from './graphic.js';



// *** Import element from the html document ***

// * Title Screen *
const titleScreen = document.getElementById('titleScreen');
const title = document.getElementById('title');
const newRoomButton = document.getElementById('newRoomButton');
const joinRoomForm = document.getElementById('joinRoomForm');
const errorRoomCode = document.getElementById('errorRoomCode');
const roomCodeInput = document.getElementById('roomCodeInput');

// * Game Screen *
const gameScreen = document.getElementById('gameScreen');

// * Game Screen : Controller Player Two *
const controllerPlayerTwo = document.getElementById('controllerPlayerTwo');
const displayPlayerTwo = document.getElementById('displayPlayerTwo');
const upButtonTwo = document.getElementById('upButtonTwo');
const leftButtonTwo = document.getElementById('leftButtonTwo');
const rightButtonTwo = document.getElementById('rightButtonTwo');
const downButtonTwo = document.getElementById('downButtonTwo');

// * Game Screen : Room Code Box *
const roomCodeBox = document.getElementById('roomCodeBox');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const copyButton = document.getElementById('copyButton');

// * Game Screen : Players Display *
const playersDisplay = document.getElementById('playersDisplay');

// * Game Screen : Game *
const backCanvas = document.getElementById('backCanvas');
const frontCanvas = document.getElementById('frontCanvas');
const readyButton = document.getElementById('readyButton');

// * Game Screen : Settings *
const settingsButton = document.getElementById('settingsButton');

// * Game Screen : Controller *
const controllerPlayer = document.getElementById('controllerPlayer');
const displayPlayer = document.getElementById('displayPlayer');
const upButton = document.getElementById('upButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const downButton = document.getElementById('downButton');

// * SetPlayer Screen *
const setPlayerScreen = document.getElementById('setPlayerScreen');
const colorInput = document.getElementById('colorInput');
const nameInput = document.getElementById('nameInput');
const useController = document.getElementById('useController');
const errorMapKey = document.getElementById('errorMapKey');
const controllerMap = document.getElementById('controllerMap');
const upButtonMap = document.getElementById('upButtonMap');
const leftButtonMap = document.getElementById('leftButtonMap');
const rightButtonMap = document.getElementById('rightButtonMap');
const downButtonMap = document.getElementById('downButtonMap');
const setPlayerExit = document.getElementById('setPlayerExit');

// * Settings Screen *
const settingsScreen = document.getElementById('settingsScreen');
const exitSettingsButton = document.getElementById('exitSettingsButton');
const localPlayersSettings = document.getElementById('localPlayersSettings');
const newPlayerButton = document.getElementById('localPlayersSettings');
const adminSettings = document.getElementById('adminSettings');
const clientsSettings = document.getElementById('clientsSettings');
const colorSettings = document.getElementById('colorSettings');
const gameplaySettings = document.getElementById('gameplaySettings');
const exitRoom = document.getElementById('exitRoom');



// *** Event Listener ***

document.addEventListener('keydown', keydown);
document.addEventListener('click', endMapKey);

// * Title Screen *
newRoomButton.addEventListener('click', newRoom);
joinRoomForm.addEventListener('submit', joinRoom);
roomCodeInput.addEventListener('input', removeErrorRoomCode);

// * Game Screen : Controller Player Two *
upButtonTwo.addEventListener('click', handleDirectionButton);
upButton.inputCode = "up";
upButton.playerTwo = true;
leftButtonTwo.addEventListener('click', handleDirectionButton);
leftButtonTwo.inputCode = "left";
leftButtonTwo.playerTwo = true;
rightButtonTwo.addEventListener('click', handleDirectionButton);
rightButtonTwo.inputCode = "right";
rightButtonTwo.playerTwo = true;
downButtonTwo.addEventListener('click', handleDirectionButton);
downButtonTwo.inputCode = "down";
downButtonTwo.playerTwo = true;

// * Game Screen : Room Code Box *
copyButton.addEventListener('click', copyRoomCode);
newPlayerButton.addEventListener('click', handleNewPlayer);

// * Game Screen : Game *
readyButton.addEventListener('click', updateReady);

// * Game Screen : Settings *
settingsButton.addEventListener('click', handleSettingsButton);

// * Game Screen : Controller *
upButton.addEventListener('click', handleDirectionButton);
upButton.inputCode = "up";
leftButton.addEventListener('click', handleDirectionButton);
leftButton.inputCode = "left";
rightButton.addEventListener('click', handleDirectionButton);
rightButton.inputCode = "right";
downButton.addEventListener('click', handleDirectionButton);
downButton.inputCode = "down";

// * SetPlayer Screen *
colorInput.addEventListener('change', updateColor, false);
nameInput.addEventListener('input', updateName);
useController.addEventListener('click', handleUseController);
upButtonMap.addEventListener('click', handleButtonMap);
upButtonMap.inputCode = "up";
leftButtonMap.addEventListener('click', handleButtonMap);
leftButtonMap.inputCode = "left";
rightButtonMap.addEventListener('click', handleButtonMap);
rightButtonMap.inputCode = "right";
downButtonMap.addEventListener('click', handleButtonMap);
downButtonMap.inputCode = "down";
setPlayerExit.addEventListener('click', handleSetPlayerExit);

// * Settings Screen *
exitSettingsButton.addEventListener('click', handleExitSettingsButton);
exitRoom.addEventListener('click', handleExitRoom);



// *** Server Listener ***

socket.on("unknownRoom", handleUnknownRoom);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("accessRestricted", handleAccessRestricted);

socket.on("wellcomePackage", handleWellcomePackage);
socket.on("settings", handleSettings);

socket.on("roomPackage", handleRoomPackage);
socket.on("onlyGameState", handleOnlyGameState);



// *** Global Variables Declaration ***

let localPlayers = {};
let localKeyCount = 0;
let localSettings;
let setPlayerKey;
let setPlayer;
let playerController;
let playerControllerTwo;
let waitForKey;

let ready = false;
let clientKey;
let keyController = {
    37: {playerKey: 1, inputCode:"left"},
    38: {playerKey: 1, inputCode:"up"},
    39: {playerKey: 1, inputCode:"right"},
    40: {playerKey: 1, inputCode:"down"},
    81: {playerKey: 1, inputCode:"left"},
    83: {playerKey: 1, inputCode:"down"},
    68: {playerKey: 1, inputCode:"right"},
    90: {playerKey: 1, inputCode:"up"},
}


// *** Initialisation ***

function initialisation() {
    blinkTitle();
    showScreen(titleScreen);
}

function blinkTitle() {
    setTimeout(function() {
        title.classList.add('blink');
        setTimeout(function() {
            title.classList.remove('blink');
            blinkTitle()
        }, 150);
    }, 2000 + Math.floor(Math.random() * 8000));
}

function showScreen(screenName) {
    titleScreen.style.display = "none";
    gameScreen.style.display = "none";
    settingsScreen.style.display = "none";
    setPlayerScreen.style.display = "none";
    screenName.style.display = "block";
}



// *** Title Screen ***

function newRoom() {
    socket.emit('newRoom');
}

function joinRoom(event) {
    errorRoomCode.innerText = "";
    const roomCode = roomCodeInput.value;
    socket.emit('joinRoom', roomCode.toUpperCase());
    event.preventDefault();
}

function handleUnknownRoom() {
    errorRoomCode.innerText = "Unknown Room Code";
}

function handleTooManyPlayers() {
    errorRoomCode.innerText = "Too many players in this Room";
}

function handleAccessRestricted() {
    errorRoomCode.innerText = "Access Restricted to this Room";
}

function removeErrorRoomCode() {
    errorRoomCode.innerText = "";
}



// *** Transition from Title to Game ***

function handleWellcomePackage(wellcomePackage) {
    let unpack = JSON.parse(wellcomePackage);
    roomCodeDisplay.innerText = unpack.roomCode;
    handleSettings(unpack.settings);
    clientKey = unpack.clientKey;
    ready = false;
    updateReadyButton();
    sendUpdate();
    if (!Object.keys(localPlayers).length) {
        handleNewPlayer()
        return;
    }
    showScreen(gameScreen);
}

function handleNewPlayer() {
    initSetPlayerScreen();
    console.log("handleNewPlayer()");
    showScreen(setPlayerScreen);
}

function handleSettings(settings) {
    localSettings = settings;
    // ONE DAY MORE
}

function sendUpdate() {
    let updatePackage = {
        players: localPlayers,
        settings: localSettings,
        ready: ready,
    }
    socket.emit('updatePackage', JSON.stringify(updatePackage));
}



// *** Set Player Screen ***

function initSetPlayerScreen() {
    if (localPlayers[setPlayerKey]) {
        setPlayer = {...localPlayers[setPlayerKey]}
    } else {
        localKeyCount ++;
        setPlayerKey = localKeyCount;
        setPlayer = {
            color: defaultColor(),
            name: defaultName(),
            score: 0,
        };
    }
    colorInput.value = setPlayer.color;
    nameInput.placeholder = setPlayer.name;
    if (mobileCheck()) {
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
    } else if (playerController && playerController !== setPlayerKey) {
        useController.style.display = "none";
        controllerMap.style.display = "block";
    } else {
        useController.style.display = "block";
        controllerMap.style.display = "block";
        updateUseControllerButton();
    }
    Object.entries(keyController).forEach( ([keyCode, value]) => {
        if (value.playerKey !== setPlayerKey) {return;}
        let buttonsMap = [upButtonMap, leftButtonMap, rightButtonMap, downButtonMap];
        buttonsMap.forEach( buttonMap =>{
            if (value.inputCode === buttonMap.inputCode) {
                buttonMap.innerText = String.fromCharCode(keyCode);
            }
        });
    });
}

function updateName(e) {setPlayer.name = e.target.value;}
function updateColor(e) {setPlayer.color = e.target.value;}

function handleUseController() {
    if (playerController === setPlayerKey) {
        playerController = null;
        controllerPlayer.style.display = "none";
    } else {
        playerController = setPlayerKey;
        controllerPlayer.style.display = "block";
        keyController = Object.fromEntries(Object.entries(keyController).filter(([key, value]) => {
            return value.playerKey !== setPlayerKey;
        }));
    }
    updateUseControllerButton();
}

function updateUseControllerButton() {
    if (playerController === setPlayerKey) {
        useController.classList.add('redbutton');
        useController.innerText = "🖱️ STOP Using Mouse";
    } else {
        useController.classList.remove('redbutton');
        useController.innerText = "🖱️ Use Mouse";
    }
}

function handleButtonMap(e) {
    errorMapKey.style.display = "block";
    e.target.classList.add('redbutton');
    waitForKey = e;
}

function endMapKey() {
    if (!waitForKey) {return;}
    waitForKey.target.classList.remove('redbutton');
    waitForKey = null;
}

function mapKey(keyCode) {
    if (!waitForKey) {return;}
    if (keyController[keyCode]) {
        let keyUser = keyController[keyCode].playerKey;
        if (keyUser !== setPlayer) {
            if (localPlayers[keyUser]) {
                errorMapKey.innerText = "Already used by "+ localPlayers[keyUser].name;
            } else {
                errorMapKey.innerText = "ERROR: Key used by an none player "+ keyUser;;
            }
            errorMapKey.style.display = "block";
        } 
    } else {
        Object.entries(keyController).forEach( ([key, value]) => {
            if (value.playerKey === setPlayerKey &&
                value.inputCode === waitForKey.target.inputCode) {
                    delete keyController[key];
                }
        });
        keyController[keyCode] = {
            playerKey: setPlayerKey, 
            inputCode: waitForKey.target.inputCode
        }
        waitForKey.target.innerText = String.fromCharCode(keyCode);
    }
    endMapKey();
}

function handleSetPlayerExit() {
    localPlayers[setPlayerKey] = {...setPlayer};
    sendUpdate();
    buildSettings();
    showScreen(settingsScreen);
}


// *** Settings Screen ***

function handleSettingsButton() {
    buildSettings();
    showScreen(settingsScreen);
}

function handleExitSettingsButton() {
    showScreen(gameScreen);
}

function buildSettings() {
    localPlayersSettings.replaceChildren();
    Object.entries(localPlayers).forEach( ([playerKey, player]) => {
        newLocalPlayerSettings(playerKey, player);
    });
    
    if (mobileCheck() && Object.keys(localPlayers).length > 1) {
        newPlayerButton.style.display = "none";
    } else {
        newPlayerButton.style.display = "block";
    }
}

function handleSetPlayerButton(e) {
    console.log("handleSetPlayerButton(e)");
    initSetPlayerScreen(e.target.playerKey);
    showScreen(setPlayerScreen);
}

function newLocalPlayerSettings(playerKey, player) {
    let localDiv = document.createElement('div');
    let setPlayerButton = document.createElement('button');
    let removeLocalPlayer = document.createElement('button');
    let playerDiv = display( 
        "not show",
        "not show", 
        "not show", 
        player.color, 
        player.name);

    localDiv.playerKey = playerKey;
    setPlayerButton.playerKey = playerKey;
    removeLocalPlayer.playerKey = playerKey;

    setPlayerButton.innerText = "✏️ Edit & 🕹️ Set Controls";
    setPlayerButton.addEventListener('click', handleSetPlayerButton);

    removeLocalPlayer.innerText = "➖ Remove Local Player";
    removeLocalPlayer.classList.add('redbutton');
    setPlayerButton.addEventListener('click', updateRemoveLocalPlayer);

    localDiv.append(playerDiv);
    localDiv.append(setPlayerButton);
    if (Object.keys(localPlayers).length > 1) {
        localDiv.append(removeLocalPlayer);
    }

    localPlayersSettings.append(localDiv);
}


function updateRemoveLocalPlayer(e) {
    if (!localPlayers[e.target.playerKey]) {return;}
    delete localPlayers[e.target.playerKey];

    if (playerControllerTwo === e.target.playerKey) {
        playerControllerTwo = null;
        roomCodeBox.style.display = "block";
        controllerPlayerTwo.style.display = "none";
    } else if (playerController === e.target.playerKey) {
        if (playerControllerTwo) {
            playerController = playerControllerTwo;
            playerControllerTwo = null;
            roomCodeBox.style.display = "block";
            controllerPlayerTwo.style.display = "none";
        } else {
            playerController = null;
            controllerPlayer.style.display = "none";
        }
    }
    keyController = Object.fromEntries(Object.entries(keyController).filter(([key, value]) => {
        return value.playerKey !== e.target.playerKey;
    }));
    buildSettings();
    sendUpdate();
}

function handleExitRoom() {
    socket.emit('exitRoom');
    showScreen(initialScreen);
}


// *** Game Screen ***

function handleRoomPackage(roomPackage) {
    let unpack = JSON.parse(roomPackage);
    handleSettings(unpack.settings);
    handlePlayers(unpack.players, unpack.readys);
    handleGameState(unpack.gameState);
}


function handleOnlyGameState(gameState) {
    handleGameState(JSON.parse(gameState));
}



// *** Game Screen : Players Display ***

function handlePlayers(players, readys) {
    let scores = Object.entries(players).map( 
        ([playerKey, player]) => {
            return [playerKey, player.score];
    });
    if (!scores.length) {return;}
    scores.sort( (first, second) => {
        return second[1] - first[1];
    });
    let maxScore = scores[0][1];
    maxScore = maxScore ? maxScore : null;

    playersDisplay.replaceChildren();
    scores.forEach( ([playerKey, score]) => {
        let player = players[playerKey];
        let playerDiv = display(
            player.admin, 
            readys[playerKey], 
            score === maxScore, 
            player.color, 
            player.name);
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
    let playerDiv = document.createElement('div');
    let adminDiv = document.createElement('h2');
    let readyDiv = document.createElement('h2');
    let scoreDiv = document.createElement('h2');
    let colorDiv = document.createElement('input');
    let nameDiv = document.createElement('h2');

    playerDiv.classList.add('player');
    adminDiv.classList.add('admin');
    readyDiv.classList.add('ready');
    scoreDiv.classList.add('score');
    colorDiv.classList.add('color');
    colorDiv.setAttribute("type", "color");
    colorDiv.disabled = true;
    nameDiv.classList.add('name');

    adminDiv.innerHTML = admin ? "🛠️" : "";
    readyDiv.innerHTML = ready  ? "✔️" : "";
    scoreDiv.innerHTML = score ? "👑" : "";
    colorDiv.value = color;
    nameDiv.innerHTML = name;

    if (admin !== "not show") {playerDiv.append(adminDiv);}
    if (ready !== "not show") {playerDiv.append(readyDiv);}
    if (score !== "not show") {playerDiv.append(scoreDiv);}
    if (color !== "not show") {playerDiv.append(colorDiv);}
    if (name !== "not show") {playerDiv.append(nameDiv);}
    return playerDiv;
}



// * Game Screen : Room Code Box *

function copyRoomCode() {
    let copyText = "Wesh bruv! Come play at \
    https://uspectacle.github.io/Snake-Multiplayer/frontend/index.html \n\
    My room code is: \n\n" + roomCodeDisplay.innerText;
    navigator.clipboard.writeText(copyText);
}



// *** Game Screen : Ready Button ***

function updateReady() {
    ready = !ready;
    updateReadyButton();
    sendUpdate();
}

function updateReadyButton() {
    if (ready) {
        readyButton.classList.add('redbutton');
        readyButton.innerText = "I'm NOT Ready";
    } else {
        readyButton.classList.remove('redbutton');
        readyButton.innerText = "I'm Ready";
    }
}




// * Game Screen : Game State *

function handleGameState(gameState) {
    if (gameState.event === "init") {
        let paintSettings = {
            colorPalette: colorPaletteDefault, 
            backgroundColors: backgroundColorsDefault, 
        }
        initPaint(backCanvas, frontCanvas, gameState, paintSettings);
        readyButton.style.opacity = 1;
        readyButton.style.display = "block";
    }
    if (gameState.event === "start") {
        readyButton.style.opacity = -(gameState.time/gameState.frameRate)/5;
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
    if (!controllerInput) {return;};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}

function handleDirectionButton(e) {
    let playerKey = e.target.playerTwo ? playerControllerTwo : playerController
    let controllerInput = {playerKey: playerKey, inputCode: e.target.inputCode};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}



// *** Initialisation ***

initialisation();


