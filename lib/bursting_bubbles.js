function BurstingBubbles(pos) {
  this.pos = pos;
  this.width = 640;
  this.height = 64;
  this.image = this.image();
  this.frameIndex = 0;
  this.tickCount = 0;
  this.ticksPerFrame = 3;
  this.numberOfFrames = 10;
}

BurstingBubbles.prototype.image = function () {
  image = new Image();
  image.src ='bubbles.png';
  return image;
};

BurstingBubbles.prototype.draw = function (ctx) {
  ctx.drawImage(
    this.image,
    this.frameIndex * this.width / this.numberOfFrames,
    0,
    this.width / this.numberOfFrames,
    this.height,
    this.pos[0] - 32,
    this.pos[1] - 32,
    this.width / this.numberOfFrames,
    this.height
  );
};

BurstingBubbles.prototype.update = function () {
  this.tickCount += 1;
  if (this.tickCount > this.ticksPerFrame) {
    this.tickCount = 0;
    if (this.frameIndex < this.numberOfFrames) {
      this.frameIndex += 1;
    }
  }
};

module.exports = BurstingBubbles;
