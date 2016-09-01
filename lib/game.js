const BubbleGrid = require('./bubble_grid');
const Shooter = require('./shooter');
const Bubble = require('./bubble');
const EmptyBubble = require('./empty_bubble');
const Defaults = require('./defaults');
const Utils = require('./utils');
const BurstingBubbles = require('./bursting_bubbles');

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
