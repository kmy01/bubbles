const Defaults = require('./defaults');
const Utils = require('./utils');

function Bubble(pos, grid) {
  this.radius = Defaults.RADIUS;
  this.vel = Defaults.VELOCITY;
  this.color = this.randomizeColor();
  this.pos = pos;
  this.grid = grid;
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

Bubble.prototype.getPos = function () {
  return this.position;
};

Bubble.prototype.move = function () {
  if (this.pos[0] + Defaults.RADIUS > Defaults.WIDTH || this.pos[0] - Defaults.RADIUS < 0) {
    this.vel[0] = -1 * this.vel[0];
  }
  this.pos[0] += this.vel[0];
  this.pos[1] += this.vel[1];
};

Bubble.prototype.isCollidedWith = function (otherBubble) {
  //check collision with top
  let dist = Utils.findDistance(this.pos, otherBubble.pos);
  return dist < (2 * this.radius) && otherBubble.constructor.name === 'Bubble';
};

Bubble.prototype.remove = function () {

};

Bubble.prototype.neighbors = function() {

};

module.exports = Bubble;
