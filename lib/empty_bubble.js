const Defaults = require('./defaults');

function EmptyBubble(pos, gridPos) {
  this.radius = Defaults.RADIUS;
  this.pos = pos;
  this.gridPos = gridPos;
}

EmptyBubble.prototype.draw = function () {

};

module.exports = EmptyBubble;
