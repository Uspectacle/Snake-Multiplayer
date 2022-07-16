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

// *** Event Listener ***

window.onload = (event) => {
  sessionStorage.removeItem("ready");
  window.dispatchEvent(new CustomEvent("store", { detail: "ready" }));
  initNavigation(document);
  socket.emit("id", clientId());
};

// *** Server Listener ***
