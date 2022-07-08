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

// *** Import element from the html document ***

// *** Event Listener ***

// *** Server Listener ***
