const Game = require('./game');

function GameView(canvasElement) {
  this.canvasElement = canvasElement;
  this.ctx = canvasElement.getContext('2d');
  this.game = new Game();
}

GameView.prototype.start = function (resetGameListener) {
  this.mouseMoveHandler();
  this.clickHandler();
  this.game.bubbleGrid.createGrid();
  let intervalId = setInterval(() => {
    this.game.step();
    this.game.draw(this.ctx);
    if (this.game.gameOver) {
      this.handleGameOver(intervalId);
      resetGameListener();
    }
  }, 10);
};

GameView.prototype.handleGameOver = function (intervalId) {
  this.ctx.fillStyle = "black";
  this.ctx.font = "italic "+20+"pt Rock Salt";
  this.ctx.fillText(`You ${this.game.gameOver}...`, 0, 30);
  this.ctx.fillText(`Press any key to Play Again!`, 0, 80);
  this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  this.ctx.fillRect(0,0,380,600);
  clearInterval(intervalId);
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
