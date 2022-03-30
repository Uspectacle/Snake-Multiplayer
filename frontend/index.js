const LOCALHOST = false;

let socketCORS = "https://stormy-crag-12352.herokuapp.com/";
if (LOCALHOST) {
    socketCORS = "http://localhost:3000";
}

const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const SNAKE_COLOUR_2 = 'red';
const FOOD_COLOUR = '#e66916';
const color_dict = {
    1: "green",
    2: "red",
};

import { io } from "socket.io-client";

const socket = io(socketCORS, {
  withCredentials: true,
  extraHeaders: {
    "server-client": "yey-ca-marche"
  }
});

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("countDown", handleCountDown);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const exitBtn = document.getElementById('exitButton');
const restartBtn = document.getElementById('restartButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameOverDisplay = document.getElementById('gameOverDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
exitBtn.addEventListener('click', exit);
restartBtn.addEventListener('click', restart);

function newGame() {
    socket.emit('newGame');
    init();
}
  
function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    gameOverDisplay.innerText = ""

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) {
    if (!gameActive){
        return;
    }
    socket.emit('keydown', e.keyCode)
}

function paintGame(state) {
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLOUR);
    paintPlayer(state.players[1], size, SNAKE_COLOUR_2);
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;

    ctx.fillStyle = colour;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive){
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive){
        return;
    }

    data = JSON.parse(data);

    if (data.winner === playerNumber) {
        gameOverDisplay.innerText = "GG! You win this one bruv";
    } else {
        gameOverDisplay.innerText = "You stinks";
    }
    gameActive = false;
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleCountDown(countDown) {
    gameOverDisplay.innerText = "Game start in " + countDown;
    if (countDown === 0) {
        gameOverDisplay.innerText = "";
        init();
    }
    gameOverDisplay.innerText += "\nYou are " + color_dict[playerNumber];
}

function handleUnknownGame() {
    exit();
    alert("Unknown game code");
}

function handleTooManyPlayers() {
    exit();
    alert("This game is already in progress");
}

function restart() {
    socket.emit('restartGame', gameCodeDisplay.innerText);
}

function exit() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "";
    gameScreen.style.display = "none";
}






