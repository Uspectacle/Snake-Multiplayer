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

import { paintGame, initPaint } from './graphic.js';

const sidebarButton = document.getElementById('sidebarButton');
const roomMenu = document.getElementById('roomMenu');
const initRoom = document.getElementById('initRoom');
const Settings = document.getElementById('Settings');
const room = document.getElementById('room');

const initialScreen = document.getElementById('initialScreen');
const newRoomButton = document.getElementById('newRoomButton');
const roomCodeInput = document.getElementById('roomCodeInput');
const joinRoomForm = document.getElementById('joinRoomForm');
const errorRoomCode = document.getElementById('errorRoomCode');

const roomScreen = document.getElementById('roomScreen');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const colorInput = document.getElementById('colorInput');
const nameInput = document.getElementById('nameInput');
const readyButton = document.getElementById('readyButton');
const playersDisplay = document.getElementById('playersDisplay');
const exitRoomButton = document.getElementById('exitRoomButton');

const gameScreen = document.getElementById('gameScreen');
const backCanvas = document.getElementById('backCanvas');
const frontCanvas = document.getElementById('frontCanvas');


const exitBtn = document.getElementById('exitButton');
const restartBtn = document.getElementById('restartButton');
const gameOverDisplay = document.getElementById('gameOverDisplay');



newRoomButton.addEventListener('click', newRoom);
joinRoomForm.addEventListener('submit', joinRoom);
roomCodeInput.addEventListener('input', removeErrorRoomCode);

nameInput.addEventListener('input', updateName);
colorInput.addEventListener('change', updateColor, false);
readyButton.addEventListener('click', updateReady);
sidebarButton.addEventListener('click', updateSidebar);
exitRoomButton.addEventListener('click', exitRoom);
document.addEventListener('keydown', keydown);


socket.on("roomCode", handleRoomCode);
socket.on("unknownRoom", handleUnknownRoom);
socket.on("tooManyPlayers", handleTooManyPlayers);

socket.on("roomComposition", handleRoomComposition);
socket.on("playerInitColor", handlePlayerInitColor);

socket.on("beginGame", handleBeginGame);
socket.on("gameState", handleGameState);


socket.on("alerting", alerting);

function alerting(text) {
    alert(text);
}

let playerNumber;
let inGame = false;
let alive = false;
let playerName;
let playerColor;
let playerReady = false;
let sideBar = true;

function updateSidebar() {
    roomMenu.style.display = sideBar ? "none" : "block";
    sideBar = !sideBar;
}


function showScreen(screenName) {
    initRoom.style.display = "none";
    Settings.style.display = "none";
    room.style.display = "none";
    screenName.style.display = "block";
}

showScreen(initRoom);

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

function removeErrorRoomCode(e) {
    errorRoomCode.innerText = "";
}



function updateName(e) {
    playerName = e.target.value;
    socket.emit('playerName', playerName);
}

function updateColor(e) {
    playerColor = e.target.value;
    socket.emit('playerColor', playerColor);
}

function updateReady() {
    playerReady = !playerReady;
    socket.emit('playerReady', playerReady);
    if (playerReady) {
        readyButton.classList.remove('green');
        readyButton.classList.add('red');
        readyButton.innerText = "I'm NOT Ready";
    } else {
        readyButton.classList.remove('red');
        readyButton.classList.add('green');
        readyButton.innerText = "I'm Ready";
    }
}

function handlePlayerInitColor(color) {
    colorInput.value = color;
}

function handleRoomCode(roomCode) {
    roomCodeDisplay.innerText = roomCode;
    playerReady = true;
    updateReady();
    showScreen(room);
}

function handleRoomComposition(players) {
    players = JSON.parse(players);
    playersDisplay.replaceChildren();
    for (const player of players) {
        var span = document.createElement('span');
        span.innerText = player.name;
        span.style.color = player.color;
        if (player.ready) {span.innerText += " ✅"}
        span.innerText += "\n";
        playersDisplay.append(span);
    }
}

function exitRoom() {
    socket.emit('exitRoom');
    showScreen(initialScreen);
}



function handleBeginGame(gameState) {
    if (inGame){return;}
    gameState = JSON.parse(gameState);
    updateReady();
    inGame = true;
    alive = true;
    console.log('init paint')
    initPaint(backCanvas, frontCanvas, gameState);
}

function handleGameState(gameState) {
    if (!inGame){return;}
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function keydown(e) {
    if (!inGame){return;}
    if (!alive){return;}
    socket.emit('keydown', e.keyCode)
}
