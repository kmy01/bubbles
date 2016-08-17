const Defaults = require('./defaults');

function Bubble(pos) {
  this.radius = Defaults.RADIUS;
  this.color = Defaults.COLOR;
  this.pos = pos || Defaults.POSITION;
  this.vel = Defaults.VELOCITY;
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

Bubble.prototype.getPos = function () {
  return this.position;
};

Bubble.prototype.move = function () {

};

Bubble.prototype.isCollidedWith = function (otherBubble) {

};

Bubble.prototype.remove = function () {

};

Bubble.prototype.neighbors = function() {

};

module.exports = Bubble;
