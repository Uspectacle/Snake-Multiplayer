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

import { handleRoomPackage } from "/frontend/handlePackage.js";
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

import { toggleFullScreen } from "/frontend/fullscreen.js";

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
} from "/frontend/utils.js";

// *** Import element from the html document ***

const title = document.getElementById("title");
const newRoomButton = document.getElementById("newRoomButton");
const joinRoomForm = document.getElementById("joinRoomForm");
const errorRoomCode = document.getElementById("errorRoomCode");
const roomCodeInput = document.getElementById("roomCodeInput");

// *** Event Listener ***

// document.addEventListener('keydown', keydown);
// document.addEventListener('click', handleClick);
newRoomButton.addEventListener("click", newRoom);
joinRoomForm.addEventListener("submit", joinRoom);
roomCodeInput.addEventListener("input", removeErrorRoomCode);

// *** Server Listener ***

socket.on("unknownRoom", handleUnknownRoom);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("accessRestricted", handleAccessRestricted);
socket.on("clientId", handleClientId);

// *** Initialisation ***
window.onload = (event) => {
  socket.emit("id", clientId());
  blinkTitle();
  initRoomCode();
};

// *** Blink the Title ***

function blinkTitle() {
  setTimeout(function () {
    title.classList.add("blink");
    setTimeout(function () {
      title.classList.remove("blink");
      blinkTitle();
    }, 150);
  }, 2000 + Math.floor(Math.random() * 8000));
}

// *** Init RoomCode from storage ***

function initRoomCode() {
  let roomCode = new URLSearchParams(window.location.search).get("r");
  if (roomCode) {
    sessionStorage.setItem("roomCode", roomCode);
  }
  if (roomCodeInput.value) {
    joinRoom();
  }
  roomCodeInput.value = sessionStorage.getItem("roomCode");
}

// *** Handle Buttons ***

function newRoom() {
  socket.emit("newRoom");
}

function joinRoom(event) {
  if (event) {
    event.preventDefault();
    sessionStorage.removeItem("roomCode");
  }
  removeErrorRoomCode();
  const roomCode = roomCodeInput.value.toUpperCase();
  if (roomCode) {
    socket.emit("joinRoom", roomCode);
  }
}

// *** Handle RoomCode errors ***

function handleUnknownRoom() {
  errorRoomCode.style.opacity = 1;
  errorRoomCode.innerText = "Unknown Room Code";
}

function handleTooManyPlayers() {
  errorRoomCode.style.opacity = 1;
  errorRoomCode.innerText = "Too many players in this Room";
}

function handleAccessRestricted() {
  errorRoomCode.style.opacity = 1;
  errorRoomCode.innerText = "Access Restricted to this Room";
}

function removeErrorRoomCode() {
  errorRoomCode.style.opacity = 0;
}

// *** Transition from Title to Game ***

function handleClientId(pack) {
  let unpack = JSON.parse(pack);
  sessionStorage.setItem("roomCode", unpack.roomCode);
  sessionStorage.setItem("clientKey", unpack.clientKey);
  sessionStorage.setItem("isLog", true);
  sessionStorage.setItem("ready", false);
  window.location.pathname = "frontend/players.html";
  return;
}
