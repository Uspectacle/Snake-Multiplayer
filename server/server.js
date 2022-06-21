// *** Server-Client Initialisation ***

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

io.listen(process.env.PORT || 3000);



// *** Import function from other local scripts ***

import { 
    createGameState,
    gameLoop, 
    updateVel,
    scoresToRewards,
} from './game.js';

import { 
    makeid, 
    combineKeys,
    splitKey,
} from './utils.js';



// *** Global Variables Declaration ***

let getRoomCode = {};
let activeRooms = {};



// *** Client Listener ***

io.on('connection', client => {

    client.on('newRoom', handleNewRoom);
    client.on('joinRoom', handleJoinRoom);

    client.on('updatePackage', handleUpdatePackage);
    
    client.on('controllerInput', handleControllerInput); // change to action playerKey updownleftright

    // client.on('playerName', handlePlayerName);
    // client.on('playerColor', handlePlayerColor);
    // client.on('exitRoom', handleExitRoom);
    // ONE DAY MORE

    client.on('disconnect', handleDisconnect);



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
                maxTime: 60*60*1000,
                numPlayerMax: 3,
                restricteAccess: false,
                admin: [0],
            },
            gameState: null,
        }
        sendToRoom(roomCode);
    }

    function handleJoinRoom(roomCode) {
        let room = activeRooms[roomCode];
        if (!room) {
            client.emit('unknownRoom');
            return;
        }
        if (room.settings.restricteAccess) {
            client.emit('accessRestricted');
            return;
        }
        let numPlayer = Object.keys(room.players).length;
        if (numPlayer >= room.settings.numPlayerMax) {
            client.emit('tooManyPlayers');
            return;
        }
        sendToRoom(roomCode);
    }

    function sendToRoom(roomCode) {
        client.join(roomCode);
        getRoomCode[client.id] = roomCode;
        let room = activeRooms[roomCode];
        const newKey = room.clientKeyCount;
        room.clientKeyCount ++;
        room.clients[client.id] = {
            key: newKey,
            ready: false,
        };
        let wellcomePackage = {
            roomCode: roomCode,
            defaultSettings: room.settings,
            clientKey: newKey,
        }
        client.emit('wellcomePackage', JSON.stringify(wellcomePackage));
    }



    // *** Update Room ***

    function handleUpdatePackage(updatePackage) {
        const roomCode = getRoomCode[client.id];
        let room = activeRooms[roomCode];
        let unpack = JSON.parse(updatePackage);
        if (!room) {return;}
        if (!room.clients) {return;}
        if (!room.clients[client.id]) {return;}
        getPlayers(roomCode, room.clients[client.id]).forEach( playerKey => {
            removePlayer(roomCode, playerKey);
        });

        Object.entries(unpack.players).forEach( ([localKey, player]) => {
            let playerKey = combineKeys([room.clients[client.id].key, localKey]);
            player.ready = unpack.ready;
            room.players[playerKey] = player;
        })
        // room.settings = unpack.settings;
        room.clients[client.id].ready = unpack.ready;

        updateRoom(roomCode);
    }

    function handleDisconnect() {
        const roomCode = getRoomCode[client.id];
        let room = activeRooms[roomCode];
        if (!room) {return;}
        if (!room.clients) {return;}
        if (!room.clients[client.id]) {return;}
        getPlayers(roomCode, room.clients[client.id]).forEach( playerKey => {
            removePlayer(roomCode, playerKey);
        });
        updateRoom(roomCode);
    }
    


    // *** Game Inputs ***

    function handleControllerInput(controllerInput) {
        const roomCode = getRoomCode[client.id];
        let room = activeRooms[roomCode];
        if (!room) {return;}
        if (!room.gameState) {return;}
        let unpack = JSON.parse(controllerInput);
        let playerKey = combineKeys([room.clients[client.id].key, unpack.playerKey]);
        let snake = room.gameState.snakes[playerKey];
        if (!snake) {return;}
        updateVel(snake, unpack.inputCode);
    }
});



// *** Update room, lauch game and send package ***

function updateRoom(roomCode) {
    let room = activeRooms[roomCode];
    if (!room) {return;}
    if (!Object.keys(room.clients).length) {
        closeRoom(roomCode);
        return;
    }

    let readys = {};
    let allReady = true;
    Object.values(room.clients).forEach( client => {
        getPlayers(roomCode, client.key).forEach( playerKey => {
            readys[playerKey] = client.ready;
            allReady = allReady && client.ready;
        });
    });

    let init = true;
    if (room.gameState) {
        if (allReady || 
            room.gameState.event === "loop") {
            init = false;   
        }
        if (room.gameState.event === "after") {
            init = true;   
        }
        if (room.gameState.event === "over") {
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
        if (allReady &&
            room.gameState.event === "init") {
            start = true;
        }
    }

    if (start) {
        room.gameClock = setInterval(() => {
            if (room.gameState) {
                Object.keys(room.gameState.snakes).forEach( snakeKey =>{
                    if (!room.players[snakeKey]) {
                        room.gameState.toKill.push(snakeKey);
                    }
                });
            }
            gameLoop(room.gameState);
            if (room.gameState.time === 0) {
                Object.values(room.clients).forEach( client => {
                    client.ready = false;
                });
            }
            if (room.gameState.event === "over") {
                clearInterval(room.gameClock);
                room.gameClock = null;
                updateRoom(roomCode); 
                return;
            }
            io.sockets.in(roomCode).emit('onlyGameState', JSON.stringify(room.gameState));
        }, 1000 / room.gameState.frameRate);
    }

    if (room.gameState) {
        scoresToRewards(room.gameState).forEach( ([playerKey, reward]) =>{
            let player = room.players[playerKey];
            if (!player) {return;}
            player.score = reward;
        })
    }

    let roomPackage = {
        settings: room.settings,
        players: room.players,
        gameState: room.gameState,
        readys: readys,
    }
    io.sockets.in(roomCode).emit('roomPackage', JSON.stringify(roomPackage));
}



// *** Remover Functions ***

function getPlayers(roomCode, clientKey) {
    let room = activeRooms[roomCode];
    return Object.keys(room.players).filter( playerKey => {
        if (splitKey(playerKey)[0] === clientKey) {
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


