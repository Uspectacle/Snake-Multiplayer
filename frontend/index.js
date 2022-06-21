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
const newPlayerButton = document.getElementById('newPlayerButton');

// * Game Screen : Players Display *
const playersDisplay = document.getElementById('playersDisplay');

// * Game Screen : Game *
const backCanvas = document.getElementById('backCanvas');
const frontCanvas = document.getElementById('frontCanvas');
const readyButton = document.getElementById('readyButton');

// * Game Screen : Settings *
const settingsButton = document.getElementById('settingsButton');

// * Game Screen : Controller *
const controller = document.getElementById('controller');
const displayPlayer = document.getElementById('displayPlayer');
const upButton = document.getElementById('upButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const downButton = document.getElementById('downButton');

// * Settings Screen *
// const settingsScreen = document.getElementById('settingsScreen'); ONE DAY MORE



// *** Event Listener ***

// * Title Screen *
newRoomButton.addEventListener('click', newRoom);
joinRoomForm.addEventListener('submit', joinRoom);
roomCodeInput.addEventListener('input', removeErrorRoomCode);

// * Game Screen : Controller Player Two *
upButtonTwo.addEventListener('click', handleUpButtonTwo);
leftButtonTwo.addEventListener('click', handleLeftButtonTwo);
rightButtonTwo.addEventListener('click', handleRightButtonTwo);
downButtonTwo.addEventListener('click', handleDownButtonTwo);

// * Game Screen : Room Code Box *
copyButton.addEventListener('click', copyRoomCode);
newPlayerButton.addEventListener('click', handleNewPlayerButton);

// * Game Screen : Game *
document.addEventListener('keydown', keydown);
readyButton.addEventListener('click', updateReady);

// * Game Screen : Settings *
// settingsButton.addEventListener('click', handleSettingsButton);

// * Game Screen : Controller *
upButton.addEventListener('click', handleUpButton);
leftButton.addEventListener('click', handleLeftButton);
rightButton.addEventListener('click', handleRightButton);
downButton.addEventListener('click', handleDownButton);

// * Settings Screen *
// ONE DAY MORE



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
let localKeyCount = 1;
let localSettings;
let playerController = 1;
let playerControllerTwo = 2;
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
    newLocalPlayer();
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

function newLocalPlayer() {
    localPlayers[localKeyCount] = {
        name: defaultName(),
        color: defaultColor(),
        alive: false,
        score: 0,
    };
    localKeyCount ++;
}

function showScreen(screenName) {
    titleScreen.style.display = "none";
    gameScreen.style.display = "none";
    // settingsScreen.style.display = "none"; ONE DAY MORE
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
    showScreen(gameScreen);
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

    playerDiv.append(adminDiv);
    playerDiv.append(readyDiv);
    playerDiv.append(scoreDiv);
    playerDiv.append(colorDiv);
    playerDiv.append(nameDiv);

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


function handleNewPlayerButton() {
    newLocalPlayer();
    sendUpdate();
    roomCodeBox.style.display = "none";
    controllerPlayerTwo.style.display = "block";
}

function keydown(e) {
    let controllerInput = keyController[e.keyCode]
    if (!controllerInput) {return;};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}

function handleUpButton() {
    let controllerInput = {playerKey: playerController, inputCode:"up"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}
function handleLeftButton() {
    let controllerInput = {playerKey: playerController, inputCode:"left"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}
function handleRightButton() {
    let controllerInput = {playerKey: playerController, inputCode:"right"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}
function handleDownButton() {
    let controllerInput = {playerKey: playerController, inputCode:"down"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}
function handleUpButtonTwo() {
    let controllerInput = {playerKey: playerControllerTwo, inputCode:"up"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}
function handleLeftButtonTwo() {
    let controllerInput = {playerKey: playerControllerTwo, inputCode:"left"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}
function handleRightButtonTwo() {
    let controllerInput = {playerKey: playerControllerTwo, inputCode:"right"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}
function handleDownButtonTwo() {
    let controllerInput = {playerKey: playerControllerTwo, inputCode:"down"};
    socket.emit('controllerInput', JSON.stringify(controllerInput));
}



// *** Initialisation ***

initialisation();




























// function updateName(e) { // TODO: adapt to localPlayers
//     playerName = e.target.value;
//     socket.emit('playerName', playerName);
// }

// function updateColor(e) { // TODO: adapt to localPlayers
//     playerColor = e.target.value;
//     socket.emit('playerColor', playerColor);
// }




// function handlePlayerInitColor(color) { // TODO: adapt to localPlayers
//     colorInput.value = color;
// }



// function exitRoom() {
//     socket.emit('exitRoom');
//     showScreen(initialScreen);
// }


// function updateSidebar() {
//     roomMenu.style.display = sideBar ? "none" : "block";
//     sideBar = !sideBar;
// }
