const http = require('http');
const socketio = require('socket.io');
const httpServer = http.createServer();
const io = new socketio.Server(httpServer, {
    cors: {
      origin: ["https://uspectacle.github.io", "http://127.0.0.1:5500"],
      allowedHeaders: ["server-client"],
      credentials: true
    }
});

const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');
const { emit } = require('process');
const { stringify } = require('querystring');

const state = {};
const clientRooms = {};
let intervalId;

io.on('connection', client => {

    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('restartGame', handleRestartGame);

    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleRestartGame(roomName) {
        state[roomName] = initGame();
        clearInterval(intervalId);
        emitCountDown(roomName);
    }

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName);
        let numClients = 0;
        if (room) {
            numClients = room.size;
        }
    
        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }
    
    
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
    
        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);
    
        emitCountDown(roomName);
    }



    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
});

function startGameInterval(roomName) {
    intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName)
        .emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName)
        .emit('gameOver', JSON.stringify({ winner }));
}

function emitCountDown(roomName) {
    let countIdx = 6;
    const intervalCount = setInterval(() => {
        countIdx += -1;
        io.sockets.in(roomName)
            .emit('countDown', countIdx);
        if (countIdx === 0) {
            startGameInterval(roomName);
            clearInterval(intervalCount);
        }
    }, 1000);
}

io.listen(process.env.PORT || 3000);