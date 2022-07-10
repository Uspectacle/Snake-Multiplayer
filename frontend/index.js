// *** Server-Client Initialisation ***

import { LOCALHOST } from './_local.js';
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



// *** FullScreen & Navigation ***

import { 
    toggleFullScreen,
} from './_fullscreen.js';

const fullScreen = document.getElementById("fullScreen");
fullScreen.addEventListener('click', haddleFullScreen);
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



// *** Import element from the html document ***

const title = document.getElementById('title');
const newRoomButton = document.getElementById('newRoomButton');
const joinRoomForm = document.getElementById('joinRoomForm');
const errorRoomCode = document.getElementById('errorRoomCode');
const roomCodeInput = document.getElementById('roomCodeInput');



// *** Event Listener ***

// document.addEventListener('keydown', keydown);
// document.addEventListener('click', handleClick);
newRoomButton.addEventListener('click', newRoom);
joinRoomForm.addEventListener('submit', joinRoom);
roomCodeInput.addEventListener('input', removeErrorRoomCode);



// *** Server Listener ***

socket.on("unknownRoom", handleUnknownRoom);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("accessRestricted", handleAccessRestricted);

socket.on("wellcomePackage", handleWellcomePackage);
socket.on("settings", handleSettings);



// *** Blink the Title ***

function blinkTitle() {
    setTimeout(function() {
        title.classList.add('blink');
        setTimeout(function() {
            title.classList.remove('blink');
            blinkTitle()
        }, 150);
    }, 2000 + Math.floor(Math.random() * 8000));
}

blinkTitle();



// *** Init RoomCode from storage ***

function initRoomCode() {
    let roomCode = new URLSearchParams(window.location.search).get("r");
    if (roomCode) {
        sessionStorage.setItem('roomCode', roomCode);
    }
    roomCodeInput.value = sessionStorage.getItem('roomCode');
}

initRoomCode();



// *** Handle Buttons ***

function newRoom() {
    socket.emit('newRoom');
}

function joinRoom(event) {
    errorRoomCode.innerText = "";
    const roomCode = roomCodeInput.value.toUpperCase();
    sessionStorage.setItem('roomCode') = roomCode;
    socket.emit('joinRoom', roomCode);
    event.preventDefault();
}



// *** Handle RoomCode errors ***

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