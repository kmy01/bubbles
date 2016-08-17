const Bubble = require('./bubble');
const Defaults = require('./defaults');

function BubbleGrid(ctx) {
  this.grid = [];
  this.ctx = ctx;
}

BubbleGrid.prototype.createGrid = function () {
  let startCoord = [Defaults.RADIUS, Defaults.RADIUS];

  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    let row = [];
    let nextCoord;

    for (var i = 0; i < 9; i++) {
      let newBubble;

      if (i === 0) {
        if (rowIdx % 2 === 1) {
          startCoord[0] = 2 * Defaults.RADIUS;
        } else {
          startCoord[0] = Defaults.RADIUS;
        }

        nextCoord = startCoord.slice();
        newBubble = new Bubble(
          nextCoord.slice(),
          this.randomizeColor(),
          this.grid
        );

        row.push(newBubble);
        continue;
      }

      nextCoord[0] = nextCoord[0] + 2 * Defaults.RADIUS;
      newBubble = new Bubble(
        nextCoord.slice(),
        this.randomizeColor(),
        this.grid
      );

      row.push(newBubble);
    }

    startCoord[1] = startCoord[1] + (2 * Defaults.RADIUS);
    this.grid.push(row);
  }
};

BubbleGrid.prototype.randomizeColor = function () {
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

BubbleGrid.prototype.newRow = function () {
  let startCoord = [Defaults.RADIUS, Defaults.RADIUS];
  let row = [];
  let nextCoord;
  let newBubble;

  for (let i = 0; i < 9; i++) {
    if (i === 0) {
      nextCoord = startCoord.slice();
      newBubble = new Bubble(
        nextCoord.slice(),
        this.randomizeColor(),
        this.grid
      );

      row.push(newBubble);
      continue;
    }

    nextCoord[0] = nextCoord[0] + 2 * Defaults.RADIUS;
    newBubble = new Bubble(
      nextCoord.slice(),
      this.randomizeColor(),
      this.grid
    );

    row.push(newBubble);
  }
  return row;
};

BubbleGrid.prototype.addNewRow = function () {

};

BubbleGrid.prototype.shiftGridDown = function () {

};

BubbleGrid.prototype.drawGrid = function () {
  this.grid.forEach((row) => {
    row.forEach((bubble) => {
      bubble.draw(this.ctx);
    });
  });
};

module.exports = BubbleGrid;
