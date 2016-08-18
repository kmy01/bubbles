const Bubble = require('./bubble');
const Defaults = require('./defaults');

function Shooter(game) {
  this.mousePos = [Defaults.WIDTH / 2, Defaults.HEIGHT - 2 * Defaults.RADIUS];
  this.game = game;
}

Shooter.prototype.draw = function (ctx) {
  let x = Defaults.WIDTH / 2;
  let y = Defaults.HEIGHT;
  let endPos = this.lineEndPos();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + endPos[0], y - endPos[1]);
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
  let xVel = 8 * Math.cos(this.angleRad);
  let yVel = -8 * Math.sin(this.angleRad);

  this.game.bubble.vel = [xVel, yVel];
};

module.exports = Shooter;
