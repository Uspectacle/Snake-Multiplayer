import { LOCALHOST } from './local.js';
let socketCORS = "https://snake-multi-psl.herokuapp.com/";
if (LOCALHOST) {
    socketCORS = "http://localhost:3000";
}

import { io } from "socket.io-client";

const socket = io(socketCORS, {
    withCredentials: true,
    extraHeaders: {
      "server-client": "yey-ca-marche"
    }
});

import { 
    paintGame, 
    initPaint, 
    colorPaletteDefault, 
    backgroundColorsDefault, 
} from './graphic.js';

const sidebarButton = document.getElementById('sidebarButton');
const roomMenu = document.getElementById('roomMenu');
const initRoom = document.getElementById('initRoom');
const Settings = document.getElementById('Settings');
const room = document.getElementById('room');

const title = document.getElementById('title');
const gameRoom = document.getElementById('gameRoom');
const initialScreen = document.getElementById('initialScreen');
const newRoomButton = document.getElementById('newRoomButton');
const roomCodeInput = document.getElementById('roomCodeInput');
const joinRoomForm = document.getElementById('joinRoomForm');
const errorRoomCode = document.getElementById('errorRoomCode');

const roomScreen = document.getElementById('roomScreen');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const copyButton = document.getElementById('copyButton');
const colorInput = document.getElementById('colorInput');
const nameInput = document.getElementById('nameInput');
const readyButton = document.getElementById('readyButton');
const playerOneDisplay = document.getElementById('playerOneDisplay');
const playersDisplay = document.getElementById('playersDisplay');
const exitRoomButton = document.getElementById('exitRoomButton');

const gameScreen = document.getElementById('gameScreen');
const backCanvas = document.getElementById('backCanvas');
const frontCanvas = document.getElementById('frontCanvas');


const exitBtn = document.getElementById('exitButton');
const restartBtn = document.getElementById('restartButton');
const gameOverDisplay = document.getElementById('gameOverDisplay');



newRoomButton.addEventListener('click', newRoom);
joinRoomForm.addEventListener('submit', joinRoom);
roomCodeInput.addEventListener('input', removeErrorRoomCode);

nameInput.addEventListener('input', updateName);
colorInput.addEventListener('change', updateColor, false);
readyButton.addEventListener('click', updateReady);
sidebarButton.addEventListener('click', updateSidebar);
copyButton.addEventListener('click', copyRoomCode);
document.addEventListener('keydown', keydown);


socket.on("roomCode", handleRoomCode);
socket.on("id", handleId);
socket.on("unknownRoom", handleUnknownRoom);
socket.on("tooManyPlayers", handleTooManyPlayers);

socket.on("roomComposition", handleRoomComposition);
socket.on("playerInitColor", handlePlayerInitColor);

socket.on("beginGame", handleBeginGame);
socket.on("gameState", handleGameState);


let playerOne;
let playerId;
let inGame = false;
let alive = false;
let playerName;
let playerColor;
let playerReady = false;
let sideBar = true;

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function showScreen(screenName) {
    initRoom.style.display = "none";
    Settings.style.display = "none";
    room.style.display = "none";
    gameRoom.style.display = "none";
    screenName.style.display = "block";
}

showScreen(initRoom);


function blinkTitle() {
    setTimeout(function() {
        title.classList.add('blink');
        setTimeout(function() {
            title.classList.remove('blink');
            blinkTitle()
        }, 150);
    }, 2000 + Math.floor(Math.random() * 8000));
}

blinkTitle();

function updateSidebar() {
    roomMenu.style.display = sideBar ? "none" : "block";
    sideBar = !sideBar;
}



function newRoom() {
    socket.emit('newRoom');
}

function joinRoom(event) {
    errorRoomCode.innerText = "";
    const roomCode = roomCodeInput.value;
    socket.emit('joinRoom', roomCode.toUpperCase());
    event.preventDefault();
}

function handleUnknownRoom() {
    errorRoomCode.innerText = "Unknown Room Code";
}

function handleTooManyPlayers() {
    errorRoomCode.innerText = "Too many players in this Room";
}

function removeErrorRoomCode(e) {
    errorRoomCode.innerText = "";
}



function updateName(e) {
    playerName = e.target.value;
    socket.emit('playerName', playerName);
}

function updateColor(e) {
    playerColor = e.target.value;
    socket.emit('playerColor', playerColor);
}

function updateReady() {
    playerReady = !playerReady;
    socket.emit('playerReady', playerReady);
    if (playerReady) {
        readyButton.classList.add('redbutton');
        readyButton.innerText = "I'm NOT Ready";
    } else {
        readyButton.classList.remove('redbutton');
        readyButton.innerText = "I'm Ready";
    }
}

function handlePlayerInitColor(color) {
    colorInput.value = color;
}

function handleRoomCode(roomCode) {
    roomCodeDisplay.innerText = roomCode;
    playerReady = true;
    updateReady();
    showScreen(room);
}

function handleId(id) {
    playerId = id;
}

function handleRoomComposition(players) {
    players = JSON.parse(players);
    playersDisplay.replaceChildren();
    let maxScore = Math.max(...players.map(player => player.score));
    maxScore = maxScore ? maxScore : null;
    for (const player of players) {
        let playerDiv = document.createElement('div');
        let adminDiv = document.createElement('h2');
        let scoreDiv = document.createElement('h2');
        let readyDiv = document.createElement('h2');
        let colorDiv = document.createElement('input');
        let nameDiv = document.createElement('h2');

        playerDiv.classList.add('player');
        adminDiv.classList.add('admin');
        scoreDiv.classList.add('score');
        readyDiv.classList.add('ready');
        colorDiv.classList.add('color');
        colorDiv.setAttribute("type", "color");
        colorDiv.disabled = true;
        nameDiv.classList.add('name');

        adminDiv.innerHTML = player.admin ? "🛠️" : "";
        scoreDiv.innerHTML = player.score === maxScore ? "👑" : "";
        readyDiv.innerHTML = player.ready ? "✔️" : "";
        colorDiv.value = player.color;
        nameDiv.innerHTML = player.name;

        playerDiv.append(adminDiv);
        playerDiv.append(scoreDiv);
        playerDiv.append(readyDiv);
        playerDiv.append(colorDiv);
        playerDiv.append(nameDiv);

        playersDisplay.append(playerDiv);

        if (player.id === playerId) {
            playerOne = {...player};
            playerOneDisplay.replaceChildren();
            playerOneDisplay.append(playerDiv.cloneNode(true));
        }
    }
}

function exitRoom() {
    socket.emit('exitRoom');
    showScreen(initialScreen);
}

function handleBeginGame(gameState) {
    if (inGame){return;}
    gameState = JSON.parse(gameState);
    inGame = true;
    alive = true;
    console.log('init paint')
    let paintSettings = {
        colorPalette: colorPaletteDefault, 
        backgroundColors: backgroundColorsDefault, 
    }
    initPaint(backCanvas, frontCanvas, gameState, paintSettings);
    requestAnimationFrame(() => paintGame(gameState));

    showScreen(gameRoom);
}

function handleGameState(gameState) {
    if (playerReady) {
        updateReady();
    }
    if (!inGame){return;}
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function keydown(e) {
    if (!inGame){return;}
    if (!alive){return;}
    socket.emit('keydown', e.keyCode)
}




function copyRoomCode() {
    let copyText = "Wesh bruv! Come play at https://uspectacle.github.io/Snake-Multiplayer/frontend/index.html \n\
    My room code is:\n\n" + roomCodeDisplay.innerText;
    navigator.clipboard.writeText(copyText);
}