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

// *** Global Variables Declaration ***

// *** Import element from the html document ***

// *** Event Listener ***

window.onload = (event) => {
  initFullScreen(document);
  socket.emit("id", clientId());
};

// *** Server Listener ***
