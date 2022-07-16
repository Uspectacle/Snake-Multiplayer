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

import { initNavigation } from "/frontend/navigation.js";
import { buildServer } from "/frontend/handlePackage.js";
const socket = buildServer();

// *** Global Variables Declaration ***

// *** Import element from the html document ***

const title = document.getElementById("title");

// *** Event Listener ***

window.onload = (event) => {
  sessionStorage.removeItem("ready");
  window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
  initNavigation(document);
  socket.emit("id", clientId());
  blinkTitle();
};

// *** Server Listener ***

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
