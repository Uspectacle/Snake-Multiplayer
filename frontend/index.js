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

// *** Import element from the html document ***

// *** Event Listener ***

window.onload = (event) => {
  initNavigation(document);
};

const fullScreen = document.getElementById("fullScreen");

fullScreen.addEventListener("click", haddleFullScreen);
function haddleFullScreen() {
  toggleFullScreen(document);
}

function toggleFullScreen(document) {
  if (document.fullscreenElement) {
    sessionStorage.removeItem("fullScreen");
    window.dispatchEvent(new CustomEvent("store", { detail: "fullScreen" }));
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen();
    }
  } else {
    sessionStorage.setItem("fullScreen", true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      /* Safari */
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      /* IE11 */
      document.documentElement.msRequestFullscreen();
    }
  }
}

// *** Server Listener ***

// *** Initialisation ***
