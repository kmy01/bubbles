# Bubbles

[Live][bubbles]

[bubbles]: http://www.keimanyeung.me/bubbles

## Description

Bubbles is a JavaScript game based on Puzzle Bobble. Players must burst clusters of bubbles on the grid with the same color and prevent the stack of bubbles from reaching the bottom line. The goal is to rid the grid of bubbles.

## Implementation

### Bubble Shooter
The movement of the bubble shooter was implemented by tracking the player's mouse movements. Below is a code snippet of this implementation.

First a `#getMousePos` method gets the current mouse position on the canvas. The `#mouseMoveHandler` creates an event listener on the canvas which triggers a callback when the player moves the mouse. The mouse position is calculated and saved to the shooter object. The `#clickHandler` adds an event listener for a click event. Whenever the player clicks, the callback fires the bubble with a fireBubble method.

```JavaScript
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
```

### Collision Checking
The bubbles are created on a 2-Dimensional array grid system. When a bubble is shot from the shooter, the game checks when it hits another object on the grid. The `#checkCollisions` method iterates through each of the bubble on the grid and checks if it has collided with any of the bubbles using `#isCollidedWith`. It checks the distance between two bubbles and returns true if the distance is less than twice the radius.

```JavaScript
Game.prototype.checkCollisions = function () {
  let otherBubble;
  for (let i = 0; i < Defaults.SIZE[0]; i++) {
    for (let j = 0; j < Defaults.SIZE[1]; j++) {
      otherBubble = this.bubbleGrid.grid[i][j];
      if (this.bubble.isCollidedWith(otherBubble) ||
          this.bubble.isCollidedTop()) {
        this.snapBubble();
        this.destroyMatches();
      }
    }
  }
};

Bubble.prototype.isCollidedWith = function (otherBubble) {
  let dist = Utils.findDistance(this.pos, otherBubble.pos);
  return dist < (2 * this.radius) && otherBubble.constructor.name === 'Bubble';
};
```

## Technologies
- JavaScript
- HTML5 Canvas

## Future Plans
- Add difficulty selector
- Improve scoring algorithm and keep track of high score
