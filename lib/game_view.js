const Game = require('./game');
const Key = require('../vendor/keymaster');

function GameView(canvasElement) {
  this.canvasElement = canvasElement;
  this.ctx = canvasElement.getContext('2d');
  this.game = new Game();
}

GameView.prototype.start = function () {
  this.mouseMoveHandler();
  this.clickHandler();
  this.game.bubbleGrid.createGrid();
  setInterval(() => {
    this.game.step();
    this.game.draw(this.ctx);
  }, 20);

};

GameView.prototype.getMousePos = function (event) {
  var rect = this.canvasElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};

GameView.prototype.mouseMoveHandler = function () {
  this.canvasElement.addEventListener('mousemove', (event) => {
    let mousePos = this.getMousePos(event);
    let shooter = this.game.shooter.mousePos = [mousePos.x, mousePos.y];
    }, false
  );
};

GameView.prototype.clickHandler = function () {
  this.canvasElement.addEventListener('click', (event) => {
    this.game.shooter.fireBubble();
  });
};

module.exports = GameView;
