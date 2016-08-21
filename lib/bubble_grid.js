const Bubble = require('./bubble');
const EmptyBubble = require('./empty_bubble');
const Defaults = require('./defaults');

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
