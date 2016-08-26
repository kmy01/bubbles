/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const GameView = __webpack_require__(1);
	const Defaults = __webpack_require__(5);
	
	document.addEventListener('DOMContentLoaded', () => {
	  const canvasElement = document.getElementsByTagName('canvas')[0];
	  canvasElement.width = Defaults.WIDTH;
	  canvasElement.height = Defaults.HEIGHT;
	
	  let gameView = new GameView(canvasElement);
	  gameView.start(resetListener);
	
	  let resetGameView = function () {
	    gameView = new GameView(canvasElement);
	    gameView.start(resetListener);
	    document.removeEventListener('keypress', resetGameView, false);
	  };
	
	  function resetListener() {
	    document.addEventListener('keypress', resetGameView, false);
	  }
	
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(2);
	
	function GameView(canvasElement) {
	  this.canvasElement = canvasElement;
	  this.ctx = canvasElement.getContext('2d');
	  this.game = new Game();
	}
	
	GameView.prototype.start = function (resetGameListener) {
	  this.mouseMoveHandler();
	  this.clickHandler();
	  this.game.bubbleGrid.createGrid();
	  let intervalId = setInterval(() => {
	    this.game.step();
	    this.game.draw(this.ctx);
	    if (this.game.gameOver) {
	      this.handleGameOver(intervalId);
	      resetGameListener();
	    }
	  }, 10);
	};
	
	GameView.prototype.handleGameOver = function (intervalId) {
	  this.ctx.fillStyle = "black";
	  this.ctx.font = "italic "+20+"pt Rock Salt";
	  this.ctx.fillText(`You ${this.game.gameOver}...`, 0, 30);
	  this.ctx.fillText(`Play Again!?`, 0, 80);
	  this.ctx.fillText(`Press any key`, 0, 130);
	  this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
	  this.ctx.fillRect(0,0,380,600);
	  clearInterval(intervalId);
	};
	
	GameView.prototype.getMousePos = function (event) {
	  var rect = this.canvasElement.getBoundingClientRect();
	  return {
	    x: event.clientX - rect.left,
	    y: event.clientY - rect.top
	  };
	};
	
	GameView.prototype.mouseMoveHandler = function () {
	  this.canvasElement.addEventListener('mousemove', (event) => {
	    let mousePos = this.getMousePos(event);
	    let shooter = this.game.shooter.mousePos = [mousePos.x, mousePos.y];
	    }, false
	  );
	};
	
	GameView.prototype.clickHandler = function () {
	  this.canvasElement.addEventListener('click', (event) => {
	    this.game.shooter.fireBubble();
	  });
	};
	
	module.exports = GameView;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const BubbleGrid = __webpack_require__(3);
	const Shooter = __webpack_require__(8);
	const Bubble = __webpack_require__(4);
	const EmptyBubble = __webpack_require__(7);
	const Defaults = __webpack_require__(5);
	const Utils = __webpack_require__(6);
	const BurstingBubbles = __webpack_require__(9);
	
	function Game() {
	  this.bubbleGrid = new BubbleGrid();
	  this.bubble = new Bubble([190, 600]);
	  this.shooter = new Shooter(this);
	  this.turnUntilRow = Defaults.TURNS;
	  this.gameOver = '';
	  this.bursts = [];
	  this.totalBubblesBurst = 0;
	}
	
	Game.prototype.draw = function (ctx) {
	  ctx.clearRect(0, 0, Defaults.WIDTH, Defaults.HEIGHT);
	  this.bubbleGrid.draw(ctx);
	  this.shooter.draw(ctx);
	  this.bubble.draw(ctx);
	  this.drawBursts(ctx);
	  this.drawEndLine(ctx);
	  this.drawScore(ctx);
	};
	
	Game.prototype.drawEndLine = function (ctx) {
	  ctx.beginPath();
	  ctx.moveTo(0, 560);
	  ctx.lineTo(380, 560);
	  ctx.strokeStyle = "#64a9d3";
	  ctx.stroke();
	};
	
	Game.prototype.drawScore = function (ctx) {
	  ctx.fillStyle = "#545454";
	  ctx.font = "italic "+12+"pt Rock Salt";
	  ctx.fillText(`Score: ${this.totalBubblesBurst}`, 10, 587);
	};
	
	Game.prototype.drawBursts = function (ctx) {
	  this.bursts.forEach((burst) => {
	    if (burst.frameIndex === 10) {
	      this.bursts.splice(this.bursts.indexOf(burst));
	    }
	    burst.draw(ctx);
	    burst.update();
	  });
	};
	
	Game.prototype.step = function () {
	  this.bubble.move();
	  this.checkCollisions();
	  if (this.turnUntilRow === 0) {
	    this.bubbleGrid.addNewRow();
	    this.turnUntilRow = Defaults.TURNS;
	  }
	  if (this.bursts.length <= 0) {
	    this.checkGameOver();
	  }
	};
	
	Game.prototype.checkCollisions = function () {
	  let otherBubble;
	  for (let i = 0; i < Defaults.SIZE[0]; i++) {
	    for (let j = 0; j < Defaults.SIZE[1]; j++) {
	      otherBubble = this.bubbleGrid.grid[i][j];
	      if (this.bubble.isCollidedWith(otherBubble) ||
	          this.bubble.isCollidedTop()) {
	        this.snapBubble();
	        this.destroyMatches();
	      }
	    }
	  }
	};
	
	Game.prototype.snapBubble = function () {
	  let newPos;
	  let gridPos = [];
	
	  for (let i = 0; i < Defaults.SIZE[0]; i++) {
	    for (let j = 0; j < Defaults.SIZE[1]; j++) {
	      let otherBubble = this.bubbleGrid.grid[i][j];
	      let dist = Utils.findDistance(this.bubble.pos, otherBubble.pos);
	
	      if (dist < (2 * this.bubble.radius) && otherBubble.constructor.name === 'EmptyBubble') {
	        if (!newPos || dist < Utils.findDistance(this.bubble.pos, newPos)) {
	          newPos = otherBubble.pos;
	          gridPos = [i, j];
	        }
	      }
	    }
	  }
	  this.turnUntilRow -= 1;
	  this.bubble.vel = Defaults.VELOCITY;
	  this.bubble.pos = newPos;
	  this.bubble.gridPos = gridPos;
	  this.bubbleGrid.grid[gridPos[0]][gridPos[1]] = this.bubble;
	};
	
	Game.prototype.destroyMatches = function () {
	  let matches = this.findMatch(this.bubble);
	  if (matches.length > 2) {
	    this.destroyBubbles(matches);
	    this.resetChecks();
	
	    let floatingClusters = this.floatingClusters();
	    floatingClusters.forEach((cluster) => {
	      this.destroyBubbles(cluster);
	    });
	  }
	  this.resetChecks();
	
	  this.bubble = new Bubble([190, 600]);
	  this.bubble.color = this.bubbleGrid.newRandomColor();
	};
	
	Game.prototype.destroyBubbles = function (bubbles) {
	  bubbles.forEach((bubble) => {
	    this.bursts.push(new BurstingBubbles(bubble.pos));
	    this.totalBubblesBurst += 1;
	    let x = bubble.gridPos[0];
	    let y = bubble.gridPos[1];
	    this.bubbleGrid.grid[x][y] = new EmptyBubble(bubble.pos, bubble.gridPos);
	  });
	};
	
	Game.prototype.findMatch = function (startBubble) {
	  let foundMatch = [];
	  let checkArray = [startBubble];
	  let currentBubble;
	  let isIndented = this.bubbleGrid.grid[0][1].pos[0] % (2 * Defaults.RADIUS) === 0;
	
	  while (checkArray.length > 0) {
	    currentBubble = checkArray.pop();
	    if (currentBubble.color === startBubble.color && !currentBubble.checked) {
	      foundMatch.push(currentBubble);
	    }
	    currentBubble.checked = true;
	    this.getNeighbors(currentBubble.neighborCoords(isIndented)).forEach((neighbor) => {
	      if (!neighbor.checked && neighbor.color === startBubble.color) {
	        checkArray.push(neighbor);
	      }
	    });
	  }
	
	  return foundMatch;
	};
	
	Game.prototype.floatingClusters = function () {
	  let clusters = [];
	  let that = this;
	
	  this.bubbleGrid.grid.forEach((row) => {
	    row.forEach((bubble) => {
	      if (bubble.constructor.name === 'Bubble') {
	        let cluster = that.findFloatingCluster(bubble);
	        if (cluster.length > 0) {
	          clusters.push(cluster);
	        }
	      }
	    });
	  });
	
	  return clusters;
	};
	
	Game.prototype.findFloatingCluster = function (startBubble) {
	  let foundMatch = [];
	  let checkArray = [startBubble];
	  let currentBubble;
	  let connectedRoof = false;
	  let isIndented = this.bubbleGrid.grid[0][1].pos[0] % (2 * Defaults.RADIUS) === 0;
	
	  while (checkArray.length > 0) {
	    currentBubble = checkArray.pop();
	    if (currentBubble.constructor.name === 'Bubble' && !currentBubble.checked) {
	      if (currentBubble.gridPos[0] === 0) {
	        return [];
	      }
	      foundMatch.push(currentBubble);
	    }
	    currentBubble.checked = true;
	    this.getNeighbors(currentBubble.neighborCoords(isIndented)).forEach((neighbor) => {
	      if (!neighbor.checked && currentBubble.constructor.name === 'Bubble') {
	        checkArray.push(neighbor);
	      }
	    });
	  }
	
	  return foundMatch;
	};
	
	Game.prototype.resetChecks = function () {
	  this.bubbleGrid.grid.forEach((row) => {
	    row.forEach((bubble) => {
	      bubble.checked = false;
	    });
	  });
	};
	
	Game.prototype.getNeighbors = function (neighborCoords) {
	  let neighbors = [];
	
	  neighborCoords.forEach((coords) => {
	    let bubble = this.bubbleGrid.grid[coords[0]][coords[1]];
	
	    if (bubble.constructor.name === 'Bubble') {
	      neighbors.push(bubble);
	    }
	  });
	
	  return neighbors;
	};
	
	Game.prototype.checkGameOver = function () {
	  if (this.isEmpty()) {
	    this.gameOver = 'win';
	  } else if (this.touchBottom()) {
	    this.gameOver = 'lose';
	  }
	};
	
	Game.prototype.touchBottom = function () {
	  let touchBottom = false;
	  let grid = this.bubbleGrid.grid;
	
	  grid[grid.length - 2].forEach((bubble) => {
	    if (bubble.constructor.name === 'Bubble') {
	      touchBottom = true;
	    }
	  });
	
	  return touchBottom;
	};
	
	Game.prototype.isEmpty = function () {
	  let isEmpty = true;
	
	  this.bubbleGrid.grid.forEach((row) => {
	    row.forEach((bubble) => {
	      if (bubble.constructor.name === 'Bubble') {
	        isEmpty = false;
	        return false;
	      }
	    });
	    if (!isEmpty) {
	      return false;
	    }
	  });
	
	  return isEmpty;
	};
	
	module.exports = Game;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	const Bubble = __webpack_require__(4);
	const EmptyBubble = __webpack_require__(7);
	const Defaults = __webpack_require__(5);
	
	function BubbleGrid() {
	  this.grid = [];
	}
	
	BubbleGrid.prototype.createGrid = function () {
	  let startCoord = [Defaults.RADIUS, Defaults.RADIUS];
	
	  for (let rowIdx = 0; rowIdx < Defaults.SIZE[0]; rowIdx++) {
	    let row = [];
	    let nextCoord;
	
	    for (let i = 0; i < 9; i++) {
	      let newBubble;
	
	      if (i === 0) {
	        if (rowIdx % 2 === 1) {
	          startCoord[0] = 2 * Defaults.RADIUS;
	        } else {
	          startCoord[0] = Defaults.RADIUS;
	        }
	
	        nextCoord = startCoord.slice();
	        if (rowIdx > 4) {
	          newBubble = new EmptyBubble(nextCoord.slice(), [rowIdx, i]);
	        } else {
	          newBubble = new Bubble(nextCoord.slice(), [rowIdx, i]);
	        }
	
	        row.push(newBubble);
	        continue;
	      }
	
	      nextCoord[0] = nextCoord[0] + 2 * Defaults.RADIUS;
	      if (rowIdx > 4) {
	        newBubble = new EmptyBubble(nextCoord.slice(), [rowIdx, i]);
	      } else {
	        newBubble = new Bubble(nextCoord.slice(), [rowIdx, i]);
	      }
	
	      row.push(newBubble);
	    }
	
	    startCoord[1] = startCoord[1] + (2 * Defaults.RADIUS);
	    this.grid.push(row);
	  }
	};
	
	BubbleGrid.prototype.addNewRow = function () {
	  let startCoord;
	  let row = [];
	  let nextCoord;
	
	  if (this.grid[0][0].pos[0] === Defaults.RADIUS) {
	    startCoord = [2 * Defaults.RADIUS, Defaults.RADIUS];
	  } else {
	    startCoord = [Defaults.RADIUS, Defaults.RADIUS];
	  }
	
	  for (let i = 0; i < 9; i++) {
	    let newBubble;
	
	    if (i === 0) {
	      nextCoord = startCoord.slice();
	      newBubble = new Bubble(nextCoord.slice(), [0, i]);
	      newBubble.color = this.newRandomColor();
	      row.push(newBubble);
	      continue;
	    }
	
	    nextCoord[0] = nextCoord[0] + 2 * Defaults.RADIUS;
	    newBubble = new Bubble(nextCoord.slice(), [0, i]);
	    newBubble.color = this.newRandomColor();
	    row.push(newBubble);
	  }
	  this.shiftGridDown();
	  this.grid.unshift(row);
	};
	
	BubbleGrid.prototype.newRandomColor = function () {
	  let remainingColors = this.remainingColors();
	  let randomNum = Math.floor(Math.random() * remainingColors.length);
	
	  return remainingColors[randomNum];
	};
	
	BubbleGrid.prototype.remainingColors = function () {
	  let remainingColors = [];
	
	  this.grid.forEach((row) => {
	    row.forEach((bubble) => {
	      if (bubble.color && !remainingColors.includes(bubble.color)) {
	        remainingColors.push(bubble.color);
	      }
	    });
	  });
	
	  return remainingColors;
	};
	
	BubbleGrid.prototype.shiftGridDown = function () {
	  this.grid.pop();
	  this.grid.forEach((row) => {
	    row.forEach((bubble) => {
	      bubble.pos[1] += 2 * Defaults.RADIUS;
	      bubble.gridPos[0] += 1;
	    });
	  });
	
	};
	
	BubbleGrid.prototype.draw = function (ctx) {
	  this.grid.forEach((row) => {
	    row.forEach((bubble) => {
	      bubble.draw(ctx);
	    });
	  });
	};
	
	module.exports = BubbleGrid;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	const Defaults = __webpack_require__(5);
	const Utils = __webpack_require__(6);
	
	function Bubble(pos, gridPos) {
	  this.radius = Defaults.RADIUS;
	  this.vel = Defaults.VELOCITY;
	  this.color = this.randomizeColor();
	  this.pos = pos;
	  this.gridPos = gridPos;
	  this.checked = false;
	}
	
	Bubble.prototype.draw = function (ctx) {
	  ctx.fillStyle = this.color;
	  ctx.beginPath();
	
	  ctx.arc(
	    this.pos[0],
	    this.pos[1],
	    this.radius,
	    0,
	    2 * Math.PI,
	    false
	  );
	
	  ctx.fill();
	};
	
	Bubble.prototype.randomizeColor = function () {
	  const rand = Math.random();
	  if (rand < 0.25) {
	    return Defaults.COLORS[0];
	  } else if (rand < 0.5) {
	    return Defaults.COLORS[1];
	  } else if (rand < 0.75) {
	    return Defaults.COLORS[2];
	  } else {
	    return Defaults.COLORS[3];
	  }
	};
	
	Bubble.prototype.move = function () {
	  if (this.pos[0] + Defaults.RADIUS > Defaults.WIDTH || this.pos[0] - Defaults.RADIUS < 0) {
	    this.vel[0] = -1 * this.vel[0];
	  }
	  this.pos[0] += this.vel[0];
	  this.pos[1] += this.vel[1];
	};
	
	Bubble.prototype.isCollidedWith = function (otherBubble) {
	  let dist = Utils.findDistance(this.pos, otherBubble.pos);
	  return dist < (2 * this.radius) && otherBubble.constructor.name === 'Bubble';
	};
	
	Bubble.prototype.isCollidedTop = function () {
	  return this.pos[1] < this.radius;
	};
	
	Bubble.prototype.neighborCoords = function(isIndented) {
	  let neighborCoords = [];
	  let x, y;
	
	  if ((this.gridPos[0] % 2 === 0 && !isIndented) || (this.gridPos[0] % 2 === 1 && isIndented)) {
	    Defaults.NEIGHBOR_OFFSET_EVEN.forEach((offset) => {
	      x = this.gridPos[0] + offset[0];
	      y = this.gridPos[1] + offset[1];
	      if (x >= 0 && x < 15 && y >= 0 && y < 9) {
	        neighborCoords.push([x, y]);
	      }
	    });
	  } else {
	    Defaults.NEIGHBOR_OFFSET_ODD.forEach((offset) => {
	      x = this.gridPos[0] + offset[0];
	      y = this.gridPos[1] + offset[1];
	      if (x >= 0 && x < 15 && y >= 0 && y < 9) {
	        neighborCoords.push([x, y]);
	      }
	    });
	  }
	
	  return neighborCoords;
	};
	
	module.exports = Bubble;


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
	  TURNS: 5,
	  SIZE: [15, 9],
	  WIDTH: '380',
	  HEIGHT: '600',
	  RADIUS: 20,
	  VELOCITY: [0, 0],
	  COLORS: ['#d97884', '#d9ce78', '#78b4d9', '#78d99d'],
	  NEIGHBOR_OFFSET_EVEN: [
	    [-1, -1],
	    [-1, 0],
	    [0, 1],
	    [1, 0],
	    [1, -1],
	    [0, -1]
	  ],
	  NEIGHBOR_OFFSET_ODD: [
	    [-1, 0],
	    [-1 , 1],
	    [0, -1],
	    [0, 1],
	    [1, 0],
	    [1, 1]
	  ]
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {
	  findDistance(coord1, coord2) {
	    let dist = Math.sqrt(
	      Math.pow(coord1[0] - coord2[0], 2) +
	      Math.pow(coord1[1] - coord2[1], 2)
	    );
	
	    return dist;
	  }
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	const Defaults = __webpack_require__(5);
	
	function EmptyBubble(pos, gridPos) {
	  this.radius = Defaults.RADIUS;
	  this.pos = pos;
	  this.gridPos = gridPos;
	}
	
	EmptyBubble.prototype.draw = function () {
	
	};
	
	module.exports = EmptyBubble;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	const Bubble = __webpack_require__(4);
	const Defaults = __webpack_require__(5);
	
	function Shooter(game) {
	  this.mousePos = [Defaults.WIDTH / 2, Defaults.HEIGHT - 2 * Defaults.RADIUS];
	  this.game = game;
	}
	
	Shooter.prototype.draw = function (ctx) {
	  let x = Defaults.WIDTH / 2;
	  let y = Defaults.HEIGHT;
	  let endPos = this.lineEndPos();
	  ctx.beginPath();
	  ctx.moveTo(x - 10, y);
	  ctx.lineTo(x + 10, y);
	  ctx.lineTo(x + endPos[0], y - endPos[1]);
	  ctx.closePath();
	  ctx.fillStyle = this.game.bubble.color;
	  ctx.fill();
	  ctx.strokeStyle = this.game.bubble.color;
	  ctx.stroke();
	};
	
	Shooter.prototype.lineEndPos = function () {
	  const opp = (Defaults.HEIGHT - this.mousePos[1]);
	  const adj = (this.mousePos[0] - Defaults.WIDTH / 2);
	
	  this.angleRad = Math.atan2(opp, adj);
	  let lineLength = 2 * Defaults.RADIUS;
	  return [lineLength * Math.cos(this.angleRad), lineLength * Math.sin(this.angleRad)];
	};
	
	Shooter.prototype.fireBubble = function () {
	  let xVel = 15 * Math.cos(this.angleRad);
	  let yVel = -15 * Math.sin(this.angleRad);
	
	  this.game.bubble.vel = [xVel, yVel];
	};
	
	module.exports = Shooter;


/***/ },
/* 9 */
/***/ function(module, exports) {

	function BurstingBubbles(pos) {
	  this.pos = pos;
	  this.width = 640;
	  this.height = 64;
	  this.image = this.image();
	  this.frameIndex = 0;
	  this.tickCount = 0;
	  this.ticksPerFrame = 3;
	  this.numberOfFrames = 10;
	}
	
	BurstingBubbles.prototype.image = function () {
	  image = new Image();
	  image.src ='bubbles.png';
	  return image;
	};
	
	BurstingBubbles.prototype.draw = function (ctx) {
	  ctx.drawImage(
	    this.image,
	    this.frameIndex * this.width / this.numberOfFrames,
	    0,
	    this.width / this.numberOfFrames,
	    this.height,
	    this.pos[0] - 32,
	    this.pos[1] - 32,
	    this.width / this.numberOfFrames,
	    this.height
	  );
	};
	
	BurstingBubbles.prototype.update = function () {
	  this.tickCount += 1;
	  if (this.tickCount > this.ticksPerFrame) {
	    this.tickCount = 0;
	    if (this.frameIndex < this.numberOfFrames) {
	      this.frameIndex += 1;
	    }
	  }
	};
	
	module.exports = BurstingBubbles;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map