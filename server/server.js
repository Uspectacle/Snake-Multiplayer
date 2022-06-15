// Remmember to launch the server localy with the command:
// npx nodemon server/server.js

import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
      origin: ["https://uspectacle.github.io", "http://127.0.0.1:5500"],
      allowedHeaders: ["server-client"],
      credentials: true
    }
});

import { initGame, gameLoop, updateVel } from './game.js';
import { numClientsMax } from './constants.js';
import { makeid, defaultColor, defaultName } from './utils.js';



let state = {};
let settings = {};
let clientRooms = {};
let timeoutReady = {}; 
let gameClock = {}; 

io.on('connection', client => {

    client.on('newRoom', handleNewRoom);
    client.on('joinRoom', handleJoinRoom);
    client.on('disconnect', handleDisconnect);
    
    client.on('playerName', handlePlayerName);
    client.on('playerColor', handlePlayerColor);
    client.on('playerReady', handlePlayerReady);
    client.on('exitRoom', handleExitRoom);

    client.on('keydown', handleKeydown);


    function handleJoinRoom(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName);
        let numClients = room ? room.size : 0;
        if (numClients === 0) {
            client.emit('unknownRoom');
            return;
        } else if (numClients >= numClientsMax) {
            client.emit('tooManyPlayers');
            return;
        }
        sendToRoom(roomName)
    }

    function handleNewRoom() {
        let roomName = makeid(5);
        while (io.sockets.adapter.rooms.get(roomName)) {
            roomName = makeid(5);
        }
        settings[roomName] = {
            gridSize: 20, 
            snakeInitSize: 3, 
            numFood: 1,
            frameRate: 5,
        }
        client.admin = true;
        sendToRoom(roomName);
    }
    
    function sendToRoom(roomName) {
        clientRooms[client.id] = roomName;
        client.name = client.name || "";
        client.color = client.color || defaultColor();
        client.admin = client.admin || false;
        client.score = 0;
        client.ready = false;
        client.emit('playerInitColor', client.color);
        client.emit('settings', JSON.stringify(settings[roomName]));
        client.emit('roomCode', roomName);
        client.join(roomName);
    }
    


    function handleExitRoom() {
        const roomName = clientRooms[client.id];
        client.leave(roomName);
        updateRoom(roomName);
    }

    function handleDisconnect() {
        const roomName = clientRooms[client.id];
        if (state[roomName]) {
            let player = state[roomName].players.splice(client.id, 1);
            state[roomName].players.push(player);
            state[roomName].toKill.push(player);
        }
        updateRoom(roomName);
    }

    function handlePlayerName(playerName) {
        const roomName = clientRooms[client.id];
        client.name = playerName;
        updateRoom(roomName);
        if (state) {return;}
        if (state[roomName]) {return;}
        getPlayer(roomName, client.id).name = playerName;
    }

    function handlePlayerColor(playerColor) {
        const roomName = clientRooms[client.id];
        client.color = playerColor;
        updateRoom(roomName);
        if (state) {return;}
        if (state[roomName]) {return;}
        getPlayer(roomName, client.id).color = playerName;
    }

    function handlePlayerReady(playerReady) {
        client.ready = playerReady;
        updateRoom(clientRooms[client.id]);
    }



    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];
        if (!state) {return;}
        if (!state[roomName]) {return;}
        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }
        updateVel(getPlayer(roomName, client.id), keyCode);
    }
});


function getPlayer(roomName, id) {
    let out;
    state[roomName].players.forEach( player => {
          if (player.id === id) {
             out = player;
             return;
          }
    });
    return out;
 }


function updateRoom(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    let numClients = room ? room.size : 0;
    if (numClients === 0) {return;}
    const players = [];
    let allReady = true;
    room.forEach(clientId => {
        const player = io.sockets.sockets.get(clientId);
        allReady = allReady && player.ready;

        players.push({
            name : player.name || defaultName(players.length),
            color : player.color,
            ready : player.ready,
            id: player.id,
        });
    });
    io.sockets.in(roomName).emit('roomComposition', JSON.stringify(players));
    if (allReady) {
        timeoutReady.roomName = setTimeout(() => {
            beginGame(roomName, players);
        }, 3000);
    }
    else {
        clearTimeout(timeoutReady.roomName);
    }
}

function beginGame(roomName, players) {
    state[roomName] = initGame(settings[roomName], players);
    io.sockets.in(roomName)
        .emit('beginGame', JSON.stringify(state[roomName]));
    startGameInterval(roomName);
}

function startGameInterval(roomName) {
    gameClock.roomName = setInterval(() => {
        if (!state) {return;}
        if (!state[roomName]) {return;}
        state[roomName].time ++;
        gameLoop(state[roomName]);
        emitGameState(roomName);

        if (!state[roomName].numAlive) {
            console.log('GAME OVER');
            state[roomName] = null;
            clearInterval(gameClock.roomName);
        }
    }, 1000 / settings[roomName].frameRate);
}

function emitGameState(roomName) {
    io.sockets.in(roomName)
        .emit('gameState', JSON.stringify(state[roomName]));
}

io.listen(process.env.PORT || 3000);