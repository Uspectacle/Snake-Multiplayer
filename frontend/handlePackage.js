export { buildServer };

import { clientId, splitKey } from "/frontend/utils.js";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

function buildServer() {
  let socketCORS = "https://snake-multi-psl.herokuapp.com/";
  if (window.location.hostname == "127.0.0.1") {
    socketCORS = "http://localhost:3000";
  }

  const socket = io(socketCORS, {
    withCredentials: true,
    extraHeaders: {
      "server-client": "yey-ca-marche",
    },
  });

  socket.on("isLog", handleIsLog);
  socket.on("clientId", handleClientId);
  socket.on("roomPackage", handleRoomPackage);
  socket.on("onlyGameState", handleOnlyGameState);
  return socket;
}

function handleIsLog(isLog) {
  if (isLog) {
    sessionStorage.setItem("isLog", true);
  } else {
    sessionStorage.removeItem("isLog");
  }
}

function handleClientId(pack) {
  let unpack = JSON.parse(pack);
  sessionStorage.setItem("roomCode", unpack.roomCode);
  sessionStorage.setItem("clientKey", unpack.clientKey);
  sessionStorage.setItem("isLog", true);
  sessionStorage.setItem("ready", false);
  window.location.pathname = "frontend/players.html";
  return;
}

function handleRoomPackage(roomPackage) {
  if (!sessionStorage.getItem("isLog")) {
    return;
  }
  if (!sessionStorage.getItem("roomCode")) {
    socket.emit("disconnect", clientId());
    sessionStorage.removeItem("isLog");
    return;
  }
  if (!sessionStorage.getItem("clientKey")) {
    socket.emit("disconnect", clientId());
    sessionStorage.removeItem("isLog");
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
}

function handleSettings(settings) {
  // ONE DAY MORE
}

function handleOnlyGameState(gameState) {
  sessionStorage.setItem("gameState", gameState);
}

function handleGameState(gameState) {
  sessionStorage.setItem("gameState", JSON.stringify(gameState));
}
