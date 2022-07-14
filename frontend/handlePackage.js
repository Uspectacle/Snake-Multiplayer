let socketCORS = "https://snake-multi-psl.herokuapp.com/";
if (window.location.hostname == "127.0.0.1") {
  socketCORS = "http://localhost:3000";
}

export { handleRoomPackage };
import { clientId, splitKey } from "/frontend/utils.js";

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

function handleGameState(gameState) {
  // Comming soon
}
