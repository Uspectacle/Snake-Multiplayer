export {
    initGame,
    gameLoop,
    updateVel,
}

let grid;

function initGame(settings, players) {
    const state = createGameState(settings, players);
    grid = Array(state.gridSize*state.gridSize);
    grid = Array.from(grid.keys());
    grid = grid.map( (_, idx) => idxToPos(idx, state.gridSize));
    randomFood(state);
    return state;
}

function same(vector1, vector2) {
    return (vector1.x == vector2.x && vector1.y == vector2.y);
}



function startingPos(slice) {
    let pos = [];
    for (let step = 0; step < slice+1; step++) {
        pos.push({x: 0, y: step});
        pos.push({x: slice, y: step});
        pos.push({x: step, y: 0});
        pos.push({x: step, y: slice});
    }
    pos = pos.filter(pos => (pos.x != pos.y && pos.x != slice - pos.y));
    return pos.sort(() => 0.5 - Math.random());
}

function createGameState(settings, players) {
    const slice = Math.ceil(players.length / 4) + 1;
    const step = Math.floor(settings.gridSize/(slice + 2));
    settings.snakeInitSize = Math.min(settings.snakeInitSize, step);
    let startingPoints = startingPos(slice).slice(0, players.length);
    players.forEach((players, playerID) => {
        players.pos = {
            x: step * (startingPoints[playerID].x + 1),
            y: step * (startingPoints[playerID].y + 1)}
        
        players.vel = {
            x: startingPoints[playerID].x ? 0 : 1,
            y: startingPoints[playerID].y ? 0 : 1,
            food: false,
        }
        players.vel.x = startingPoints[playerID].x - slice ? players.vel.x : -1;
        players.vel.y = startingPoints[playerID].y - slice ? players.vel.y : -1;

        players.snake = [];
        for (let cell = 0; cell < settings.snakeInitSize + 1; cell++) {
            players.snake.push({
                x: players.pos.x - cell * players.vel.x, 
                y: players.pos.y - cell * players.vel.y,
                food: false,
            });
        }

        players.nextVel = players.vel;
        players.bufferVel = players.vel;
        players.last = players.snake.pop();
        players.alive = true;
    });
    return {
        players: players, 
        food: [],
        numAlive: players.length,
        numFood: settings.numFood,
        gridSize: settings.gridSize,
        time: - 5 * settings.frameRate - 1,
        frameRate: settings.frameRate,
        toKill: [],
    };
}



function isFree(state, cell) {
    for (let player of state.players) {
        for (let wall of player.snake) {
            if (same(cell, wall)) {
                return false;
            }
        }
    }
    for (let wall of state.food) {
        if (same(cell, wall)) {
            return false;
        }
    }
    return true;
}

function idxToPos(idx, gridSize) {
    return {
        x: idx % gridSize, 
        y: ~~(idx / gridSize),
    };
}

function randomFood(state) {
    let foodToDo = state.numFood - state.food.length;
    if (foodToDo <= 0) {return;}
    let freeCells = grid.filter(cell => isFree(state, cell));
    freeCells = freeCells.sort(() => 0.5 - Math.random());
    freeCells = freeCells.slice(0, foodToDo);
    state.food = state.food.concat(freeCells);
}



function keyToVel(keyCode) {
    switch (keyCode) {
        case 37: { // left
            return { x: -1, y: 0 };
        }
        case 38: { // down
            return { x: 0, y: -1 };
        }
        case 39: { // right
            return { x: 1, y: 0 };
        }
        case 40: { // up
            return { x: 0, y: 1 };
        }
    }
}

function velCheck(vel, nextVel) {
    return !(nextVel.x * vel.x || nextVel.y * vel.y);
}

function updateVel(player, keyCode) {
    if (!player) {return;}
    if (!player.alive) {return;}
    let vel = keyToVel(keyCode)
    if (!vel) {return;}
    if (velCheck(player.vel, vel)) {
        player.nextVel = {...vel};
        player.bufferVel = {...vel};
    } else if (velCheck(player.nextVel, vel)) {
        player.bufferVel = {...vel};
    }
}

function move(state) {
    state.players.forEach( player => {
        if (!player.alive) {
            player.snake = [];
            return;
        }

        // loose tail if no food
        player.last = player.snake.pop(); 
        if (player.last.food) {
            player.last.food = false;
            player.snake.push({...player.last});
            player.last.food = true;
        }

        // move head
        player.vel = {...player.nextVel};
        player.nextVel = {...player.bufferVel};
        player.pos.x += player.vel.x;
        player.pos.y += player.vel.y;
        player.pos.food = false;

        // eat food
        state.food.forEach( (food, foodIdx) => {
            if (same(food, player.pos)) {
                player.pos.food = true;
                state.food.splice(foodIdx, 1);
                return;
            }
        });
        // add head to body
        player.snake.unshift({...player.pos});
    });
}


function killSnake(state, player) {
    if (!player) {return;}
    if (!player.alive) {return;}
    if (player.last.food) {
        player.snake.pop();
    }
    player.snake.push({...player.last});
    player.snake.forEach( cell => {
        if (cell.food) {
            state.food.push({...cell})
        }
    });
    player.pos = player.snake.shift();
    player.alive = false;
    state.numAlive -= 1;
}

function checkDeathOutbound(state) {
    state.players.forEach( player => { 
        if (!player.alive) {return;}
        if (player.pos.x < 0 || 
            player.pos.x > state.gridSize-1 || 
            player.pos.y < 0 || 
            player.pos.y > state.gridSize-1
            ) {
            killSnake(state, player);
        }
    });
}

function checkDeathHeadCollision(state) {
    state.players.forEach( (player, playerID) => { 
        if (!player.alive) {return;}
        state.players.forEach( (other, otherID) => {
            if (!other.alive) {return;}
            if (otherID <= playerID) {return;}
            if (same(other.pos, player.pos)) {
                killSnake(state, other);
                if (player.alive) {
                    killSnake(state, player);
                }
            }
        });
    });
}


function checkDeathOverBody(state) {
    let check = true; 
    while (check) {
        check = false;
        state.players.forEach( player => { 
            if (!player.alive) {return;}
            state.players.forEach( other => {
                if (!other.alive) {return;}
                if (!player.alive) {return;}
                other.snake.forEach( (cell, cellidx) => {
                    if (!cellidx) {return;}
                    if (same(cell, player.pos)) {
                        killSnake(state, player);
                        check = true;
                        return;
                    }
                });
            });
        });
    }
}


function gameLoop(state) {
    if (!state){return;}
    if (state.time < 0) {return;}
    if (!state.players) {return;}
    move(state);
    state.toKill.forEach( player => {
        killSnake(state, player);
    });
    state.toKill = [];
    checkDeathOutbound(state);
    checkDeathHeadCollision(state);
    checkDeathOverBody(state);
    randomFood(state);
}
