// *** Server-Client Initialisation ***

// Remmember to launch the server localy with the command:
// npx nodemon server/server.js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://uspectacle.github.io",
      "http://127.0.0.1:5500",
      "https://psl.institute",
    ],
    allowedHeaders: ["server-client"],
    credentials: true,
  },
});

io.listen(process.env.PORT || 3000);

// *** Import function from other local scripts ***

import {
  createGameState,
  gameLoop,
  updateVel,
  scoresToRewards,
} from "./game.js";

import { makeid, combineKeys, splitKey } from "./utils.js";

// *** Global Variables Declaration ***

let activeRooms = {};
let disconnectTimeout = {};
let clients = {};
let ids = {};

// *** Client Listener ***

io.on("connection", (client) => {
  client.on("newRoom", handleNewRoom);
  client.on("joinRoom", handleJoinRoom);
  client.on("controllerInput", handleControllerInput);
  client.on("updatePlayers", handleUpdatePlayers);
  client.on("updateReady", handleUpdateReady);
  client.on("disconnect", handleDisconnect);
  client.on("id", handleId);

  function handleId(clientId) {
    if (!clientId) {
      return;
    }
    clients[clientId] = client;
    ids[client.id] = clientId;

    const roomCode = JSON.parse(clientId).roomCode;
    if (roomCode) {
      let room = activeRooms[roomCode];
      if (room) {
        if (room.clients) {
          if (room.clients[clientId]) {
            clearTimeout(disconnectTimeout[clientId]);
            delete disconnectTimeout[clientId];
          }
        }
      }
    }
    handleDisconnect();
  }
  // *** Transition from Title to Game ***

  function handleNewRoom() {
    let roomCode = makeid(5);
    while (activeRooms[roomCode]) {
      roomCode = makeid(5);
    }
    activeRooms[roomCode] = {
      players: {},
      clients: {},
      clientKeyCount: 1,
      gameClock: null,
      settings: {
        gridSize: 21,
        bodyInitSize: 3,
        numFood: 1,
        frameRate: 5,
        maxTime: 60 * 60 * 1000,
        numPlayerMax: 3,
        restricteAccess: false,
        admin: [0],
      },
      gameState: null,
    };
    sendToRoom(roomCode);
  }

  function handleJoinRoom(roomCode) {
    let room = activeRooms[roomCode];
    if (!room) {
      client.emit("unknownRoom");
      return;
    }
    if (room.settings.restricteAccess) {
      client.emit("accessRestricted");
      return;
    }
    let numPlayer = Object.keys(room.players).length;
    if (numPlayer >= room.settings.numPlayerMax) {
      client.emit("tooManyPlayers");
      return;
    }
    sendToRoom(roomCode);
  }

  function sendToRoom(roomCode) {
    client.join(roomCode);
    let room = activeRooms[roomCode];
    const newKey = room.clientKeyCount;
    room.clientKeyCount++;

    let clientId = JSON.stringify({
      roomCode: roomCode,
      clientKey: `${newKey}`,
    });
    room.clients[clientId] = {
      ready: false,
    };
    client.emit("clientId", clientId);
  }

  // *** Update Room ***

  function handleUpdateReady(ready) {
    if (!ids[client.id]) {
      return;
    }
    let clientId = JSON.parse(ids[client.id]);
    const roomCode = clientId.roomCode;
    let room = activeRooms[roomCode];
    if (!room) {
      return;
    }
    if (!room.clients) {
      return;
    }
    let thisClient = room.clients[ids[client.id]];
    if (!thisClient) {
      return;
    }
    thisClient.ready = ready ? true : false;
    updateRoom(roomCode);
  }

  function handleUpdatePlayers(updatePlayers) {
    let localPlayers = JSON.parse(updatePlayers);
    let clientId = JSON.parse(ids[client.id]);
    const roomCode = clientId.roomCode;
    let room = activeRooms[roomCode];
    if (!room) {
      return;
    }
    if (!room.clients) {
      return;
    }
    let thisClient = room.clients[ids[client.id]];
    if (!thisClient) {
      return;
    }
    getPlayers(ids[client.id]).forEach((playerKey) => {
      removePlayer(roomCode, playerKey);
    });
    if (localPlayers) {
      Object.entries(localPlayers).forEach(([localKey, player]) => {
        let playerKey = combineKeys([clientId.clientKey, localKey]);
        room.players[playerKey] = player;
      });
    }
    updateRoom(roomCode);
  }

  function disconnect() {
    let clientId = ids[client.id];
    if (clientId) {
      const roomCode = JSON.parse(clientId).roomCode;
      if (roomCode) {
        let room = activeRooms[roomCode];
        if (room) {
          if (room.clients) {
            if (room.clients[clientId]) {
              if (clients[clientId] == client.id) {
                clients[clientId].emit("disconnect");
                getPlayers(clientId).forEach((playerKey) => {
                  removePlayer(roomCode, playerKey);
                });
                updateRoom(roomCode);
              }
            }
          }
        }
      }
    }
  }

  function handleDisconnect() {
    let clientId = ids[client.id];
    if (clientId) {
      disconnectTimeout[clientId] = setTimeout(disconnect, 5);
    }
  }

  // *** Game Inputs ***

  function handleControllerInput(pack) {
    let controllerInput = JSON.parse(pack);
    const roomCode = JSON.parse(ids[client.id]).roomCode;
    if (!roomCode) {
      return;
    }
    let room = activeRooms[roomCode];
    if (!room) {
      return;
    }
    if (!room.gameState) {
      return;
    }
    let playerKey = combineKeys([
      JSON.parse(ids[client.id]).clientKey,
      controllerInput.playerKey,
    ]);
    let snake = room.gameState.snakes[playerKey];
    if (!snake) {
      return;
    }
    updateVel(snake, controllerInput.inputCode);
  }
});

// *** Update room, lauch game and send package ***

function updateRoom(roomCode) {
  let room = activeRooms[roomCode];
  if (!room) {
    return;
  }
  if (!Object.keys(room.clients).length) {
    closeRoom(roomCode);
    return;
  }

  let readys = {};
  let allReady = true;
  Object.entries(room.clients).forEach(([clientId, client]) => {
    getPlayers(clientId).forEach((playerKey) => {
      room.players[playerKey].ready = client.ready;
      readys[playerKey] = client.ready;
    });
    allReady = allReady && client.ready;
  });

  let init = true;
  if (room.gameState) {
    if (allReady || room.gameState.event == "loop") {
      init = false;
    }
    if (room.gameState.event == "after") {
      init = true;
    }
    if (room.gameState.event == "over") {
      room.gameState.event = "after";
      init = false;
    }
  }
  if (init) {
    clearInterval(room.gameClock);
    room.gameClock = null;
    room.gameState = createGameState(room.settings, room.players);
  }

  let start = false;
  if (room.gameState) {
    if (allReady && room.gameState.event == "init") {
      start = true;
    }
  }

  if (start) {
    room.gameClock = setInterval(() => {
      if (room.gameState) {
        Object.keys(room.gameState.snakes).forEach((snakeKey) => {
          if (!room.players[snakeKey]) {
            room.gameState.toKill.push(snakeKey);
          }
        });
      }
      gameLoop(room.gameState);
      if (room.gameState.time == 0) {
        Object.values(room.clients).forEach((client) => {
          client.ready = false;
        });
      }
      if (room.gameState.event == "over") {
        clearInterval(room.gameClock);
        room.gameClock = null;
        updateRoom(roomCode);
        return;
      }
      Object.keys(room.clients).forEach((clientId) => {
        if (!clients[clientId]) {
          return;
        }
        clients[clientId].emit("onlyGameState", JSON.stringify(room.gameState));
      });
    }, 1000 / room.gameState.frameRate);
  }

  if (room.gameState) {
    scoresToRewards(room.gameState).forEach(([playerKey, reward]) => {
      let player = room.players[playerKey];
      if (!player) {
        return;
      }
      player.score = reward;
    });
  }

  let roomPackage = {
    settings: room.settings,
    players: room.players,
    gameState: room.gameState,
    readys: readys,
  };
  Object.keys(room.clients).forEach((clientId) => {
    if (!clients[clientId]) {
      return;
    }
    clients[clientId].emit("roomPackage", JSON.stringify(roomPackage));
  });
}

// *** Remover Functions ***

function getPlayers(clientIdPack) {
  let clientId = JSON.parse(clientIdPack);
  const roomCode = clientId.roomCode;
  let room = activeRooms[roomCode];
  return Object.keys(room.players).filter((playerKey) => {
    if (splitKey(playerKey)[0] == clientId.clientKey) {
      return playerKey;
    }
  });
}

function removePlayer(roomCode, playerKey) {
  let room = activeRooms[roomCode];
  delete room.players[playerKey];
}

function closeRoom(roomCode) {
  delete activeRooms[roomCode];
}

// *** ONE DAY MORE ***

// function handleExitRoom() {
//     const roomCode = getRoomCode[client.id];
//     client.leave(roomCode);
//     updateRoom(roomCode);
// }
