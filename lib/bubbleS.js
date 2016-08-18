const GameView = require('./game_view');
const Defaults = require('./defaults');

document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementsByTagName('canvas')[0];
  canvasElement.width = Defaults.WIDTH;
  canvasElement.height = Defaults.HEIGHT;

  let gameView = new GameView(canvasElement);
  gameView.start();
});
