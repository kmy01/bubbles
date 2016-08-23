module.exports = {
  TURNS: 5,
  SIZE: [15, 9],
  WIDTH: '380',
  HEIGHT: '600',
  RADIUS: 20,
  VELOCITY: [0, 0],
  COLORS: ['#d97884', '#d9ce78', '#78b4d9', '#78d99d'],
  NEIGHBOR_OFFSET_EVEN: [
    [-1, -1],
    [-1, 0],
    [0, 1],
    [1, 0],
    [1, -1],
    [0, -1]
  ],
  NEIGHBOR_OFFSET_ODD: [
    [-1, 0],
    [-1 , 1],
    [0, -1],
    [0, 1],
    [1, 0],
    [1, 1]
  ]
};
