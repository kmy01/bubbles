const BubbleGrid = require('./bubble_grid');
const Shooter = require('./shooter');
const Bubble = require('./bubble');
const Defaults = require('./defaults');
const Utils = require('./utils');

function Game() {
  this.bubbleGrid = new BubbleGrid();
  this.bubble = new Bubble([190, 600], this.bubbleGrid.grid);
  this.shooter = new Shooter(this);
}

Game.prototype.draw = function (ctx) {
  ctx.clearRect(0, 0, Defaults.WIDTH, Defaults.HEIGHT);
  this.bubbleGrid.draw(ctx);
  this.bubble.draw(ctx);
  this.shooter.draw(ctx);
};

Game.prototype.step = function () {
  this.bubble.move();
  this.checkCollision();
};

Game.prototype.checkCollision = function () {
  let otherBubble;
  for (let i = 0; i < Defaults.SIZE[0]; i++) {
    for (let j = 0; j < Defaults.SIZE[1]; j++) {
      otherBubble = this.bubbleGrid.grid[i][j];
      if (this.bubble.isCollidedWith(otherBubble)) {
        this.snapBubble();
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
  
  this.bubble.vel = Defaults.VELOCITY;
  this.bubble.pos = newPos;
  this.bubbleGrid.grid[gridPos[0]][gridPos[1]] = this.bubble;
  this.bubble = new Bubble([190, 600], this.bubbleGrid.grid);
};

module.exports = Game;
