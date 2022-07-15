export { initPaint, paintGame, colorPaletteDefault, backgroundColorsDefault };

// *** Global Variables Declaration ***

const colorPaletteDefault = {
  void: "#00000000",
  player: "#000000",
  food: "#ff3300",
  foodLight: "#ff9933",
  skull: "#999999",
  snake: "#00cc00",
  snakeLight: "#00ff0080",
};
const backgroundColorsDefault = ["#00660050", "#00660080"];
let colorPalette = { ...colorPaletteDefault };
let backgroundColors = [...backgroundColorsDefault];

const spritesSize = 10;
const spritesSrc = "../Images/sprites.png";

let spritesCanevas = document.createElement("canvas");
let spritesCtx = spritesCanevas.getContext("2d");
spritesCtx.imageSmoothingEnabled = false;
let spriteImg;
let spriteKeys;

let ctx;
let background;
let cellSize;
let canevasSize;

// *** Open Sprite File ***

function loadSprite(src, callback) {
  spriteImg = new Image();
  spriteImg.onload = callback;
  spriteImg.src = src;
}

loadSprite(spritesSrc, function () {
  const w = spriteImg.width;
  const h = spriteImg.height;
  const keys = Object.keys(colorPalette);

  spritesCanevas = document.createElement("canvas");
  spritesCtx = spritesCanevas.getContext("2d");
  spritesCanevas.width = w;
  spritesCanevas.height = h;
  spritesCtx.drawImage(spriteImg, 0, 0, w, h);
  let spritedata = spritesCtx.getImageData(0, 0, w, h).data;

  spriteKeys = [];
  for (var pixel = 0; pixel < spritedata.length; pixel += 4) {
    if (spritedata[pixel + 3] < 128) {
      spriteKeys.push(keys[0]);
    } else {
      let key = 0;
      for (var color = 0; color < 3; color++) {
        key += spritedata[pixel + color];
      }
      key = Math.round(((keys.length - 2) * (key / 3)) / 255);
      spriteKeys.push(keys[key + 1]);
    }
  }
});

// *** Draw sprite on canevas with the proper color ***

function hexToRGBA(hex) {
  let alpha = hex.slice(7, 9);
  alpha = alpha.length ? parseInt(alpha, 16) : 255;
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    alpha,
  ];
}

function colorSprites() {
  const w = spritesCanevas.width;
  const h = spritesCanevas.height;
  let coloredSprites = spritesCtx.getImageData(0, 0, w, h);

  spriteKeys.forEach((key, pixel) => {
    const color = hexToRGBA(colorPalette[key]);
    color.forEach((colorAmp, colorIdx) => {
      coloredSprites.data[pixel * 4 + colorIdx] = colorAmp;
    });
  });
  spritesCtx.clearRect(0, 0, w, h);
  spritesCtx.putImageData(coloredSprites, 0, 0);
}

function draw(context, spriteIdx, position) {
  context.drawImage(
    spritesCanevas,
    spriteIdx[1] * spritesSize,
    spriteIdx[0] * spritesSize,
    spritesSize,
    spritesSize,
    cellSize + position.x * cellSize,
    cellSize + position.y * cellSize,
    cellSize,
    cellSize
  );
}

// *** Initialisation ***

function initPaint(backCanvas, frontCanvas, state, settings) {
  cellSize = backCanvas.height / (state.gridSize + 2);
  canevasSize = (state.gridSize + 2) * cellSize;

  background = backCanvas.getContext("2d");
  ctx = frontCanvas.getContext("2d");

  background.clearRect(0, 0, canevasSize, canevasSize);
  ctx.clearRect(0, 0, canevasSize, canevasSize);

  background.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  colorPalette = settings.colorPalette;
  backgroundColors = settings.backgroundColors;
  colorSprites();

  paintBackground(state.gridSize);
  paintBorder(state.gridSize);
}

// *** Paint Main Loop ***

function paintGame(state) {
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, canevasSize, canevasSize);
  paintSnake(state);
  paintFood(state);
  paintTime(state);
}

function paintBackground(gridSize) {
  for (let row = 0; row < gridSize + 2; row++) {
    for (let col = 0; col < gridSize + 2; col++) {
      background.fillStyle = backgroundColors[(row + col) % 2];
      background.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
    }
  }
}

function paintBorder(gridSize) {
  for (let idx = 0; idx < gridSize; idx++) {
    draw(background, [5, 4], { x: -1, y: idx });
    draw(background, [5, 4], { x: gridSize, y: idx });
    draw(background, [4, 4], { x: idx, y: -1 });
    draw(background, [4, 4], { x: idx, y: gridSize });
  }
  draw(background, [3, 4], { x: -1, y: -1 });
  draw(background, [2, 4], { x: gridSize, y: -1 });
  draw(background, [1, 4], { x: gridSize, y: gridSize });
  draw(background, [0, 4], { x: -1, y: gridSize });
}

function paintFood(state) {
  let frame = state.time > 0 ? state.time % 6 : 5 - (-state.time % 6);
  state.food.forEach((food) => {
    draw(ctx, [frame, 5], food);
  });
}

function paintTime(state) {
  if (state.time > state.frameRate - 1) {
    return;
  }
  if (state.time < -5 * state.frameRate + 1) {
    return;
  }
  let center = {
    x: Math.floor(state.gridSize / 2),
    y: Math.floor(state.gridSize / 2),
  };
  let timeCol = 5 + Math.floor(state.time / state.frameRate);
  draw(ctx, [9, timeCol], center);
}

function paintSnake(state) {
  Object.values(state.snakes).forEach((snake) => {
    let context = snake.alive ? ctx : background;
    colorPalette["player"] = snake.color;
    colorSprites();
    snake.body.forEach((cell, idx) => {
      draw(context, snakeSprite(snake, idx), cell);
    });
  });
}

// *** Select right snake sprite ***

function snakeSprite(snake, idx) {
  let row = snake.body[idx].food ? 1 : 0;
  row = snake.alive ? row : 2;
  if (idx) {
    row += 3;
    if (idx < snake.body.length - 1) {
      // Body
      row += 3;
      let curve = {
        x: snake.body[idx - 1].x - snake.body[idx + 1].x,
        y: snake.body[idx - 1].y - snake.body[idx + 1].y,
      };
      let vel = {
        x: snake.body[idx - 1].x - snake.body[idx].x,
        y: snake.body[idx - 1].y - snake.body[idx].y,
      };
      return [row, curvToCol(curve, vel)];
    } else {
      // Tail
      let vel = {
        x: snake.body.at(-2).x - snake.body.at(-1).x,
        y: snake.body.at(-2).y - snake.body.at(-1).y,
      };
      return [row, velToCol(vel)];
    }
  } else {
    // Head
    return [row, velToCol(snake.vel)];
  }
}

function velToCol(vel) {
  if (vel.x) {
    // > : <
    return vel.x > 0 ? 0 : 2;
  } else {
    // ^ : v
    return vel.y > 0 ? 3 : 1;
  }
}

function curvToCol(curve, vel) {
  if (curve.x && curve.y) {
    if (curve.x == curve.y) {
      // (>^ or v<) : (^> or <v)
      return vel.x > vel.y ? 2 : 4;
    } else {
      // (>v or ^<) : (v> or <^)
      return vel.x + vel.y > 0 ? 5 : 3;
    }
  } else {
    // (>> or <<) : (^^ or vv)
    return vel.x ? 0 : 1;
  }
}
