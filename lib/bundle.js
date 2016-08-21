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

	const GameView = __webpack_require__(2);
	const Defaults = __webpack_require__(6);
	
	document.addEventListener('DOMContentLoaded', () => {
	  const canvasElement = document.getElementsByTagName('canvas')[0];
	  canvasElement.width = Defaults.WIDTH;
	  canvasElement.height = Defaults.HEIGHT;
	
	  let gameView = new GameView(canvasElement);
	  gameView.start();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const BubbleGrid = __webpack_require__(3);
	const Shooter = __webpack_require__(7);
	const Bubble = __webpack_require__(4);
	const EmptyBubble = __webpack_require__(9);
	const Defaults = __webpack_require__(6);
	const Utils = __webpack_require__(10);
	
	function Game() {
	  this.bubbleGrid = new BubbleGrid();
	  this.bubble = new Bubble([190, 600]);
	  this.shooter = new Shooter(this);
	  this.turnUntilRow = Defaults.TURNS;
	  this.gameOver = '';
	}
	
	Game.prototype.draw = function (ctx) {
	  ctx.clearRect(0, 0, Defaults.WIDTH, Defaults.HEIGHT);
	  this.bubbleGrid.draw(ctx);
	  this.bubble.draw(ctx);
	  this.shooter.draw(ctx);
	  ctx.beginPath();
	  ctx.moveTo(0, 560);
	  ctx.lineTo(380, 560);
	  ctx.strokeStyle = "#64a9d3";
	  ctx.stroke();
	};
	
	Game.prototype.step = function () {
	  this.bubble.move();
	  this.checkCollisions();
	  if (this.turnUntilRow === 0) {
	    this.bubbleGrid.addNewRow();
	    this.turnUntilRow = Defaults.TURNS;
	  }
	  this.checkGameOver();
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
	
	Game.prototype.destroyBubbles = function (bubbles) {
	  bubbles.forEach((bubble) => {
	    let x = bubble.gridPos[0];
	    let y = bubble.gridPos[1];
	    this.bubbleGrid.grid[x][y] = new EmptyBubble(bubble.pos, bubble.gridPos);
	  });
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
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	const Key = __webpack_require__(8);
	
	function GameView(canvasElement) {
	  this.canvasElement = canvasElement;
	  this.ctx = canvasElement.getContext('2d');
	  this.game = new Game();
	}
	
	GameView.prototype.start = function () {
	  this.mouseMoveHandler();
	  this.clickHandler();
	  this.game.bubbleGrid.createGrid();
	  let intervalId = setInterval(() => {
	    this.game.step();
	    this.game.draw(this.ctx);
	    if (this.game.gameOver) {
	      this.handleGameOver(intervalId);
	    }
	  }, 20);
	};
	
	GameView.prototype.handleGameOver = function (intervalId) {
	  this.ctx.fillStyle = "black";
	  this.ctx.font = "italic "+20+"pt Rock Salt";
	  this.ctx.fillText(`You ${this.game.gameOver}...`, 0, 30);
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	const Bubble = __webpack_require__(4);
	const EmptyBubble = __webpack_require__(9);
	const Defaults = __webpack_require__(6);
	
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
	      row.push(newBubble);
	      continue;
	    }
	
	    nextCoord[0] = nextCoord[0] + 2 * Defaults.RADIUS;
	    newBubble = new Bubble(nextCoord.slice(), [0, i]);
	    row.push(newBubble);
	  }
	  this.shiftGridDown();
	  this.grid.unshift(row);
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

	const Defaults = __webpack_require__(6);
	const Utils = __webpack_require__(10);
	
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
/* 5 */,
/* 6 */
/***/ function(module, exports) {

	module.exports = {
	  TURNS: 8,
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	const Bubble = __webpack_require__(4);
	const Defaults = __webpack_require__(6);
	
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
	  ctx.fill();
	  ctx.closePath();
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	//     keymaster.js
	//     (c) 2011-2012 Thomas Fuchs
	//     keymaster.js may be freely distributed under the MIT license.
	
	;(function(global){
	  var k,
	    _handlers = {},
	    _mods = { 16: false, 18: false, 17: false, 91: false },
	    _scope = 'all',
	    // modifier keys
	    _MODIFIERS = {
	      '⇧': 16, shift: 16,
	      '⌥': 18, alt: 18, option: 18,
	      '⌃': 17, ctrl: 17, control: 17,
	      '⌘': 91, command: 91
	    },
	    // special keys
	    _MAP = {
	      backspace: 8, tab: 9, clear: 12,
	      enter: 13, 'return': 13,
	      esc: 27, escape: 27, space: 32,
	      left: 37, up: 38,
	      right: 39, down: 40,
	      del: 46, 'delete': 46,
	      home: 36, end: 35,
	      pageup: 33, pagedown: 34,
	      ',': 188, '.': 190, '/': 191,
	      '`': 192, '-': 189, '=': 187,
	      ';': 186, '\'': 222,
	      '[': 219, ']': 221, '\\': 220
	    },
	    code = function(x){
	      return _MAP[x] || x.toUpperCase().charCodeAt(0);
	    },
	    _downKeys = [];
	
	  for(k=1;k<20;k++) _MODIFIERS['f'+k] = 111+k;
	
	  // IE doesn't support Array#indexOf, so have a simple replacement
	  function index(array, item){
	    var i = array.length;
	    while(i--) if(array[i]===item) return i;
	    return -1;
	  }
	
	  var modifierMap = {
	      16:'shiftKey',
	      18:'altKey',
	      17:'ctrlKey',
	      91:'metaKey'
	  };
	  function updateModifierKey(event) {
	      for(k in _mods) _mods[k] = event[modifierMap[k]];
	  };
	
	  // handle keydown event
	  function dispatch(event, scope){
	    var key, handler, k, i, modifiersMatch;
	    key = event.keyCode;
	
	    if (index(_downKeys, key) == -1) {
	        _downKeys.push(key);
	    }
	
	    // if a modifier key, set the key.<modifierkeyname> property to true and return
	    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
	    if(key in _mods) {
	      _mods[key] = true;
	      // 'assignKey' from inside this closure is exported to window.key
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
	      return;
	    }
	    updateModifierKey(event);
	
	    // see if we need to ignore the keypress (filter() can can be overridden)
	    // by default ignore key presses if a select, textarea, or input is focused
	    if(!assignKey.filter.call(this, event)) return;
	
	    // abort if no potentially matching shortcuts found
	    if (!(key in _handlers)) return;
	
	    // for each potential shortcut
	    for (i = 0; i < _handlers[key].length; i++) {
	      handler = _handlers[key][i];
	
	      // see if it's in the current scope
	      if(handler.scope == scope || handler.scope == 'all'){
	        // check if modifiers match if any
	        modifiersMatch = handler.mods.length > 0;
	        for(k in _mods)
	          if((!_mods[k] && index(handler.mods, +k) > -1) ||
	            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
	        // call the handler and stop the event if neccessary
	        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
	          if(handler.method(event, handler)===false){
	            if(event.preventDefault) event.preventDefault();
	              else event.returnValue = false;
	            if(event.stopPropagation) event.stopPropagation();
	            if(event.cancelBubble) event.cancelBubble = true;
	          }
	        }
	      }
	    }
	  };
	
	  // unset modifier keys on keyup
	  function clearModifier(event){
	    var key = event.keyCode, k,
	        i = index(_downKeys, key);
	
	    // remove key from _downKeys
	    if (i >= 0) {
	        _downKeys.splice(i, 1);
	    }
	
	    if(key == 93 || key == 224) key = 91;
	    if(key in _mods) {
	      _mods[key] = false;
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
	    }
	  };
	
	  function resetModifiers() {
	    for(k in _mods) _mods[k] = false;
	    for(k in _MODIFIERS) assignKey[k] = false;
	  }
	
	  // parse and assign shortcut
	  function assignKey(key, scope, method){
	    var keys, mods, i, mi;
	    if (method === undefined) {
	      method = scope;
	      scope = 'all';
	    }
	    key = key.replace(/\s/g,'');
	    keys = key.split(',');
	
	    if((keys[keys.length-1])=='')
	      keys[keys.length-2] += ',';
	    // for each shortcut
	    for (i = 0; i < keys.length; i++) {
	      // set modifier keys if any
	      mods = [];
	      key = keys[i].split('+');
	      if(key.length > 1){
	        mods = key.slice(0,key.length-1);
	        for (mi = 0; mi < mods.length; mi++)
	          mods[mi] = _MODIFIERS[mods[mi]];
	        key = [key[key.length-1]];
	      }
	      // convert to keycode and...
	      key = key[0]
	      key = code(key);
	      // ...store handler
	      if (!(key in _handlers)) _handlers[key] = [];
	      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
	    }
	  };
	
	  // Returns true if the key with code 'keyCode' is currently down
	  // Converts strings into key codes.
	  function isPressed(keyCode) {
	      if (typeof(keyCode)=='string') {
	        keyCode = code(keyCode);
	      }
	      return index(_downKeys, keyCode) != -1;
	  }
	
	  function getPressedKeyCodes() {
	      return _downKeys.slice(0);
	  }
	
	  function filter(event){
	    var tagName = (event.target || event.srcElement).tagName;
	    // ignore keypressed in any elements that support keyboard data input
	    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
	  }
	
	  // initialize key.<modifier> to false
	  for(k in _MODIFIERS) assignKey[k] = false;
	
	  // set current scope (default 'all')
	  function setScope(scope){ _scope = scope || 'all' };
	  function getScope(){ return _scope || 'all' };
	
	  // delete all handlers for a given scope
	  function deleteScope(scope){
	    var key, handlers, i;
	
	    for (key in _handlers) {
	      handlers = _handlers[key];
	      for (i = 0; i < handlers.length; ) {
	        if (handlers[i].scope === scope) handlers.splice(i, 1);
	        else i++;
	      }
	    }
	  };
	
	  // cross-browser events
	  function addEvent(object, event, method) {
	    if (object.addEventListener)
	      object.addEventListener(event, method, false);
	    else if(object.attachEvent)
	      object.attachEvent('on'+event, function(){ method(window.event) });
	  };
	
	  // set the handlers globally on document
	  addEvent(document, 'keydown', function(event) { dispatch(event, _scope) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
	  addEvent(document, 'keyup', clearModifier);
	
	  // reset modifiers to false whenever the window is (re)focused.
	  addEvent(window, 'focus', resetModifiers);
	
	  // store previously defined key
	  var previousKey = global.key;
	
	  // restore previously defined key and return reference to our key object
	  function noConflict() {
	    var k = global.key;
	    global.key = previousKey;
	    return k;
	  }
	
	  // set window.key and window.key.set/get/deleteScope, and the default filter
	  global.key = assignKey;
	  global.key.setScope = setScope;
	  global.key.getScope = getScope;
	  global.key.deleteScope = deleteScope;
	  global.key.filter = filter;
	  global.key.isPressed = isPressed;
	  global.key.getPressedKeyCodes = getPressedKeyCodes;
	  global.key.noConflict = noConflict;
	
	  if(true) module.exports = key;
	
	})(this);


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	const Defaults = __webpack_require__(6);
	
	function EmptyBubble(pos, gridPos) {
	  this.radius = Defaults.RADIUS;
	  this.pos = pos;
	  this.gridPos = gridPos;
	}
	
	EmptyBubble.prototype.draw = function () {
	
	};
	
	module.exports = EmptyBubble;


/***/ },
/* 10 */
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


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map