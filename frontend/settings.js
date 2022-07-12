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

import { handleRoomPackage } from "https://uspectacle.github.io/Snake-Multiplayer/frontend/_handlePackage.js";
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

import { toggleFullScreen } from "https://uspectacle.github.io/Snake-Multiplayer/frontend/_fullscreen.js";

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

// *** Import element from the html document ***

// *** Event Listener ***

// *** Server Listener ***
