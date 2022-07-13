let socketCORS = "https://snake-multi-psl.herokuapp.com/";
let baseHref = "https://uspectacle.github.io/Snake-Multiplayer";
if (window.location.hostname == "127.0.0.1:5500") {
  socketCORS = "http://localhost:3000";
  baseHref = "";
}

export { handleRoomPackage };
import { clientId, splitKey } from "/frontend/_utils.js";

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
  sessionStorage.setItem("remotePlayers", remote);
  if (window.location.pathname == "frontend/players.html") {
    updatePlayers();
  }
}

function handleSettings(settings) {
  // ONE DAY MORE
}

function handleGameState(gameState) {
  // Comming soon
}
