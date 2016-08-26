const GameView = require('./game_view');
const Defaults = require('./defaults');

document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementsByTagName('canvas')[0];
  canvasElement.width = Defaults.WIDTH;
  canvasElement.height = Defaults.HEIGHT;

  let gameView = new GameView(canvasElement);
  gameView.start(resetListener);

  let resetGameView = function () {
    gameView = new GameView(canvasElement);
    gameView.start(resetListener);
    document.removeEventListener('keypress', resetGameView, false);
  };

  function resetListener() {
    document.addEventListener('keypress', resetGameView, false);
  }

});
