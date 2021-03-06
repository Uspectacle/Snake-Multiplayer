export { buildServer };

import { clientId, splitKey, localSize } from "/frontend/utils.js";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

let socket;

function buildServer() {
  let socketCORS = "https://snake-multi-psl.herokuapp.com/";
  if (location.hostname == "127.0.0.1") {
    socketCORS = "http://localhost:3000";
  }

  socket = io(socketCORS, {
    withCredentials: true,
    extraHeaders: {
      "server-client": "yey-ca-marche",
    },
  });

  socket.on("disconnect", handleDisconnect);
  socket.on("clientId", handleClientId);
  socket.on("roomPackage", handleRoomPackage);
  socket.on("onlyGameState", handleOnlyGameState);
  return socket;
}

function handleDisconnect() {
  sessionStorage.removeItem("remotePlayers");
  window.dispatchEvent(new CustomEvent("store", { detail: "remotePlayers" }));
  sessionStorage.removeItem("clientKey");
  window.dispatchEvent(new CustomEvent("store", { detail: "clientKey" }));
  location.pathname = "frontend/home.html";
}

function handleClientId(pack) {
  let unpack = JSON.parse(pack);
  sessionStorage.setItem("roomCode", unpack.roomCode);
  sessionStorage.setItem("clientKey", unpack.clientKey);
  window.dispatchEvent(new CustomEvent("store", { detail: "roomCode" }));
  window.dispatchEvent(new CustomEvent("store", { detail: "clientKey" }));
  socket.emit("id", clientId());
  location.pathname = "frontend/players.html";
  return;
}

function handleRoomPackage(roomPackage) {
  if (
    !sessionStorage.getItem("clientKey") ||
    !sessionStorage.getItem("roomCode")
  ) {
    sessionStorage.removeItem("clientKey");
    window.dispatchEvent(new CustomEvent("store", { detail: "clientKey" }));
    socket.emit("disconnect");
    return;
  }
  let unpack = JSON.parse(roomPackage);
  handlePlayers(unpack.players);
  handleSettings(unpack.settings);
  handleGameState(unpack.gameState);
}

function handlePlayers(players) {
  let remote = {};
  Object.entries(players).forEach(([playerKey, player]) => {
    let keys = splitKey(playerKey);
    if (keys[0] == sessionStorage.getItem("clientKey")) {
      return;
    }
    remote[playerKey] = player;
  });
  sessionStorage.setItem("remotePlayers", JSON.stringify(remote));
  window.dispatchEvent(new CustomEvent("store", { detail: "remotePlayers" }));
}

function handleSettings(settings) {
  // ONE DAY MORE
}

function handleOnlyGameState(gameState) {
  sessionStorage.setItem("gameState", gameState);
  window.dispatchEvent(new CustomEvent("store", { detail: "gameState" }));
}

function handleGameState(gameState) {
  sessionStorage.setItem("gameState", JSON.stringify(gameState));
  window.dispatchEvent(new CustomEvent("store", { detail: "gameState" }));
}
