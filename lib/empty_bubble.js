const Defaults = require('./defaults');

function EmptyBubble(pos, grid) {
  this.radius = Defaults.RADIUS;
  this.pos = pos;
  this.grid = grid;
}

EmptyBubble.prototype.draw = function () {

};

EmptyBubble.prototype.getPos = function () {
  return this.position;
};

EmptyBubble.prototype.remove = function () {

};

EmptyBubble.prototype.neighbors = function() {

};

module.exports = EmptyBubble;
