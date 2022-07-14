// *** Import function from other local scripts ***

import {
  defaultColor,
  defaultName,
  clientId,
  mobileCheck,
  splitKey,
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

// *** Import element from the html document ***

const title = document.getElementById("title");
const newRoomButton = document.getElementById("newRoomButton");
const joinRoomForm = document.getElementById("joinRoomForm");
const errorRoomCode = document.getElementById("errorRoomCode");
const roomCodeInput = document.getElementById("roomCodeInput");

// *** Event Listener ***

window.onload = (event) => {
  initFullScreen(document);
  socket.emit("id", clientId());
  blinkTitle();
  initRoomCode();
};

newRoomButton.addEventListener("click", newRoom);
joinRoomForm.addEventListener("submit", joinRoom);
roomCodeInput.addEventListener("input", removeErrorRoomCode);

// *** Server Listener ***

socket.on("unknownRoom", handleUnknownRoom);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("accessRestricted", handleAccessRestricted);

// *** Initialisation ***

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
