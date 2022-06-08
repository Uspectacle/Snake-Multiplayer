export  {
    paintGame,
    initPaint,
}

let spritesCanevas = document.createElement('canvas');
let spritesCtx = spritesCanevas.getContext('2d');
let spriteImg;
let spriteRGBA;
let newSprite;

function loadSprite(src, callback) {
    spriteImg = new Image();
    spriteImg.onload = callback;
    spriteImg.src = src;
}

loadSprite("../Images/sprites.png", function() {
    let w = spriteImg.width;
    let h = spriteImg.height;
    spritesCanevas = document.createElement('canvas');
    spritesCtx = spritesCanevas.getContext('2d');
    spritesCanevas.width = w;
    spritesCanevas.height = h;
    spritesCtx.drawImage(spriteImg, 0, 0, w, h);
    spriteRGBA = spritesCtx.getImageData(0, 0, w, h);
    newSprite = spritesCtx.getImageData(0, 0, w, h);
});


const spritesSize = 10;
let cellSize;
const backgroundColors = ['#231f2050', '#002b1480'];
let ctx;
let background;

function draw(context, spriteIdx, position, color) {
    if (color) {    
        newColor("#000000", color)
        spritesCtx.clearRect(
            0, 0, 
            spritesCanevas.width, 
            spritesCanevas.height
            );
        spritesCtx.putImageData(newSprite, 0, 0,);
    }
    context.drawImage(
        spritesCanevas, 
        spriteIdx[1] * spritesSize, 
        spriteIdx[0] * spritesSize,
        spritesSize,
        spritesSize,
        cellSize + position.x * cellSize,
        cellSize + position.y * cellSize,
        cellSize,
        cellSize,
        );
}

function hexToRGBA(hex){
    let alpha = parseInt(hex.slice(7, 9), 16);
    return {r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
        a: alpha ? alpha : 255,
    }
}

function newColor(oldColor, newColor){
    oldColor = hexToRGBA(oldColor);
    newColor = hexToRGBA(newColor);
    for (var i = 0; i < spriteRGBA.data.length; i+=4){
        if (!i) {
        }
        if(spriteRGBA.data[i] === oldColor.r &&
            spriteRGBA.data[i+1] === oldColor.g &&
            spriteRGBA.data[i+2] === oldColor.b &&
            spriteRGBA.data[i+3] === oldColor.a
        ){
            newSprite.data[i] = newColor.r;
            newSprite.data[i+1] = newColor.g;
            newSprite.data[i+2] = newColor.b;
            newSprite.data[i+3] = newColor.a;
        }
    }
}

function initPaint(backCanvas, frontCanvas, state) {
    cellSize = backCanvas.height / (state.gridSize + 2);

    background = backCanvas.getContext('2d');
    ctx = frontCanvas.getContext('2d');
    console.log(backCanvas.width, backCanvas.height);
    console.log(frontCanvas.width, frontCanvas.height);

    background.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    paintBackground(state.gridSize);
    paintBorder(state.gridSize);
}

function paintGame(state) {
    let canevasSize = (state.gridSize + 2) * cellSize;
    ctx.clearRect(0, 0, canevasSize, canevasSize);
    paintPlayer(state);
    paintFood(state);
    paintTime(state);
}



function paintBackground(gridSize) {
    for (let row = 0; row < (gridSize + 2); row++) {
        for (let col = 0; col < (gridSize + 2); col++) {
            background.fillStyle = backgroundColors[(row+col) % 2];
            background.fillRect(
                row * cellSize, 
                col * cellSize, 
                cellSize, 
                cellSize);
        }
    }
}

function paintBorder(gridSize) {
    for (let idx = 0; idx < gridSize; idx++) {
        draw(background, [5, 4], {x: -1, y: idx,});
        draw(background, [5, 4], {x: gridSize, y: idx,});
        draw(background, [4, 4], {x: idx, y: -1,});
        draw(background, [4, 4], {x: idx, y: gridSize,});
    }
    draw(background, [3, 4], {x: -1, y: -1,});
    draw(background, [2, 4], {x: gridSize, y: -1,});
    draw(background, [1, 4], {x: gridSize, y: gridSize,});
    draw(background, [0, 4], {x: -1, y: gridSize,});
}

function paintFood(state) {
    let frame = state.time > 0 ? state.time % 6 : 5 - (-state.time) % 6;
    state.food.forEach(food => {
        draw(ctx, [frame, 5], food);
    });
}

function paintTime(state) {
    if (state.time > 0) {return;}
    if (state.time < -5*state.frameRate) {return;}
    let center = {
        x: Math.floor(state.gridSize / 2),
        y: Math.floor(state.gridSize / 2),
    }
    let timeCol =  5 + Math.floor(state.time/state.frameRate);
    draw(ctx, [9, timeCol], center);
}

function paintPlayer(state) {
    state.players.forEach(player => {
        let context = player.alive ? ctx : background;
        player.snake.forEach((cell, idx) => {
            draw(context, playerSprite(player, idx), cell, player.color);
        });
    });
}

function playerSprite(player, idx) {
    let row = player.snake[idx].food ? 1 : 0;
    row = player.alive ? row : 2;
    if (idx) {
        row += 3;
        if (idx < (player.snake.length - 1)) {
            row += 3;
            let curve = {
                x: player.snake[idx-1].x - player.snake[idx+1].x,
                y: player.snake[idx-1].y - player.snake[idx+1].y,
            };
            let vel = {
                x: player.snake[idx-1].x - player.snake[idx].x,
                y: player.snake[idx-1].y - player.snake[idx].y,
            };
            return [row, curvToCol(curve, vel)];
        } else {
            let vel = {
                x: player.snake.at(-2).x - player.snake.at(-1).x,
                y: player.snake.at(-2).y - player.snake.at(-1).y,
            };
            return [row, velToCol(vel)];
        }
    } else {
        return [row, velToCol(player.vel)];
    }
}

function velToCol(vel) {
    if (vel.x) {
        return vel.x > 0 ? 0 : 2;
    } else {
        return vel.y > 0 ? 3 : 1;
    }
}

function curvToCol(curve, vel) {
    if (curve.x && curve.y) {
        if (curve.x === curve.y) { 
            // (>^ or v<) : (^> or <v)
            return (vel.x > vel.y) ? 2 : 4;
        } else {
            // (>v or ^<) : (v> or <^)
            return (vel.x + vel.y > 0) ? 5 : 3;
        }
    } else {
        // (>> or <<) : (^^ or vv)
        return vel.x ? 0 : 1;
    }
}