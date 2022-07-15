export { createGameState, gameLoop, scoresToRewards, updateVel };

// *** Utils Functions ***

function same(vector1, vector2) {
  return vector1.x == vector2.x && vector1.y == vector2.y;
}

function startingPos(slice) {
  let pos = [];
  for (let step = 0; step < slice + 1; step++) {
    pos.push({ x: step, y: 0 });
    pos.push({ x: 0, y: step });
    pos.push({ x: step, y: slice });
    pos.push({ x: slice, y: step });
  }
  pos = pos.filter((pos) => pos.x != pos.y && pos.x != slice - pos.y);
  return pos; //.sort(() => 0.5 - Math.random());
}

function idxToPos(idx, gridSize) {
  return {
    x: idx % gridSize,
    y: ~~(idx / gridSize),
  };
}

// *** Initialisation ***

function createGameState(settings, players) {
  let snakes = JSON.parse(JSON.stringify(players));
  const numSnakes = Object.keys(snakes).length;
  const slice = Math.ceil(numSnakes / 4) + 1;
  const step = Math.floor(settings.gridSize / (slice + 2));
  let startingPoints = startingPos(slice);
  settings.bodyInitSize = Math.min(settings.bodyInitSize, step);

  Object.values(snakes).forEach((snake) => {
    const starting = startingPoints.pop();
    snake.head = {
      x: step * (starting.x + 1),
      y: step * (starting.y + 1),
    };
    snake.vel = {
      x: starting.x ? 0 : 1,
      y: starting.y ? 0 : 1,
      food: false,
    };
    snake.vel.x = starting.x - slice ? snake.vel.x : -1;
    snake.vel.y = starting.y - slice ? snake.vel.y : -1;

    snake.body = [];
    for (let cell = 0; cell < settings.bodyInitSize + 1; cell++) {
      snake.body.push({
        x: snake.head.x - cell * snake.vel.x,
        y: snake.head.y - cell * snake.vel.y,
        food: false,
      });
    }

    snake.nextVel = snake.vel;
    snake.bufferVel = snake.vel;
    snake.last = snake.body.pop();
    snake.alive = true;
    snake.score = numSnakes;
  });
  return {
    snakes: snakes,
    food: [],
    numAlive: numSnakes,
    numFood: settings.numFood,
    gridSize: settings.gridSize,
    time: -5 * settings.frameRate,
    maxTime: settings.maxTime,
    frameRate: settings.frameRate,
    toKill: [],
    event: "init",
  };
}

// *** Loop Functions : Main ***

function gameLoop(state) {
  if (!state) {
    return true;
  }
  if (state.event == "over") {
    return;
  }
  // Update time
  state.time++;
  if (state.event == "init") {
    state.event = "start";
  }
  if (state.event == "start") {
    if (state.time < 0) {
      return;
    }
    state.event = "loop";
  }
  // Update score
  Object.values(state.snakes).forEach((snake) => {
    if (snake.alive) {
      snake.score = state.time + snake.body.length;
    }
  });
  if (state.time > state.maxTime * state.frameRate) {
    state.event = "over";
    return;
  }
  // Update position and kill snakes
  move(state);
  state.toKill.forEach((playerKey) => {
    killSnake(state, state.snakes[playerKey]);
  });
  state.toKill = [];
  checkDeathOutbound(state);
  checkDeathHeadCollision(state);
  checkDeathOverBody(state);
  if (state.numAlive < 1) {
    state.event = "over";
    return;
  }
  // Update food
  randomFood(state);
}

// *** Loop Functions : Move ***

function move(state) {
  Object.values(state.snakes).forEach((snake) => {
    if (!snake.alive) {
      snake.body = [];
      return;
    }

    // loose tail if no food
    snake.last = snake.body.pop();
    if (snake.last.food) {
      snake.last.food = false;
      snake.body.push({ ...snake.last });
      snake.last.food = true;
    }

    // move head
    snake.vel = { ...snake.nextVel };
    snake.nextVel = { ...snake.bufferVel };
    snake.head.x += snake.vel.x;
    snake.head.y += snake.vel.y;
    snake.head.food = false;

    // eat food
    state.food.forEach((food, foodIdx) => {
      if (same(food, snake.head)) {
        snake.head.food = true;
        state.food.splice(foodIdx, 1);
        return;
      }
    });
    // add head to body
    snake.body.unshift({ ...snake.head });
  });
}

// *** Loop Functions : 3 ways of dying + deconnection ***

function killSnake(state, snake) {
  if (!snake) {
    return;
  }
  if (!snake.alive) {
    return;
  }
  if (snake.last.food) {
    snake.body.pop();
  }
  snake.body.push({ ...snake.last });
  snake.body.forEach((cell) => {
    if (cell.food) {
      state.food.push({ ...cell });
    }
  });
  snake.head = snake.body.shift();
  snake.alive = false;
  snake.score -= snake.body.length;
  state.numAlive -= 1;
}

function checkDeathOutbound(state) {
  Object.values(state.snakes).forEach((snake) => {
    if (!snake.alive) {
      return;
    }
    if (
      snake.head.x < 0 ||
      snake.head.x > state.gridSize - 1 ||
      snake.head.y < 0 ||
      snake.head.y > state.gridSize - 1
    ) {
      killSnake(state, snake);
    }
  });
}

function checkDeathHeadCollision(state) {
  Object.values(state.snakes).forEach((snake, snakeIndex) => {
    if (!snake.alive) {
      return;
    }
    Object.values(state.snakes).forEach((other, otherIndex) => {
      if (!other.alive) {
        return;
      }
      if (otherIndex <= snakeIndex) {
        return;
      }
      if (same(other.head, snake.head)) {
        killSnake(state, other);
        if (snake.alive) {
          killSnake(state, snake);
        }
      }
    });
  });
}

function checkDeathOverBody(state) {
  let check = true;
  while (check) {
    check = false;
    Object.values(state.snakes).forEach((snake) => {
      if (!snake.alive) {
        return;
      }
      Object.values(state.snakes).forEach((other) => {
        if (!other.alive) {
          return;
        }
        if (!snake.alive) {
          return;
        }
        other.body.forEach((cell, cellidx) => {
          if (!cellidx) {
            return;
          }
          if (same(cell, snake.head)) {
            killSnake(state, snake);
            check = true;
            return;
          }
        });
      });
    });
  }
}

// *** Loop Functions : Placing Food ***

function randomFood(state) {
  let foodToDo = state.numFood - state.food.length;
  if (foodToDo <= 0) {
    return;
  }
  let grid = Array(state.gridSize * state.gridSize);
  grid = Array.from(grid.keys());
  grid = grid.map((_, idx) => idxToPos(idx, state.gridSize));
  let freeCells = grid.filter((cell) => isFree(state, cell));
  freeCells = freeCells.sort(() => 0.5 - Math.random());
  freeCells = freeCells.slice(0, foodToDo);
  state.food = state.food.concat(freeCells);
}

function isFree(state, cell) {
  for (let snake of Object.values(state.snakes)) {
    for (let snakeCell of snake.body) {
      if (same(cell, snakeCell)) {
        return false;
      }
    }
  }
  for (let foodCell of state.food) {
    if (same(cell, foodCell)) {
      return false;
    }
  }
  return true;
}

// *** Handle Player Input ***

function inputToVel(inputCode) {
  switch (inputCode) {
    case "left": {
      return { x: -1, y: 0 };
    }
    case "up": {
      return { x: 0, y: -1 };
    }
    case "right": {
      return { x: 1, y: 0 };
    }
    case "down": {
      return { x: 0, y: 1 };
    }
  }
}

function velCheck(vel, nextVel) {
  return !(nextVel.x * vel.x || nextVel.y * vel.y);
}

function updateVel(snake, inputCode) {
  if (!snake) {
    return;
  }
  if (!snake.alive) {
    return;
  }
  let vel = inputToVel(inputCode);
  if (!vel) {
    return;
  }
  if (velCheck(snake.vel, vel)) {
    snake.nextVel = { ...vel };
    snake.bufferVel = { ...vel };
  } else if (velCheck(snake.nextVel, vel)) {
    snake.bufferVel = { ...vel };
  }
}

// *** Compute Score ***

function scoresToRewards(state) {
  let scores = Object.entries(state.snakes).map(([playerKey, snake]) => {
    return [playerKey, snake.score];
  });
  scores.sort((first, second) => {
    return first[1] - second[1];
  });
  let reward;
  let lastScore;
  return scores.map(([playerKey, score], scoreIndex) => {
    reward = score == lastScore ? reward : scoreIndex;
    lastScore = score;
    return [playerKey, reward];
  });
}
