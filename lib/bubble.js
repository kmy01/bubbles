const Defaults = require('./defaults');
const Utils = require('./utils');

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
