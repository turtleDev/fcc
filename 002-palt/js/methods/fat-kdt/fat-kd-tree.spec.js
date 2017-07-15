'use strict';

const KDTree = require('./kd-tree');
const Pixel = require('../../pixel');

(function simpleTest() {
  const points = [
    new Pixel(1, 0, 0),
    new Pixel(2, 0, 0),
    new Pixel(3, 0, 0),
    new Pixel(4, 0, 0),
    new Pixel(5, 0, 0)
  ];

  const kdt = new KDTree(points, ['red', 'green', 'blue']);
  if ( kdt.tree.value != points[2] ) {
    throw new Error('failed');
  }
})();

(function lessSimpleTest() {
  const dataset = [
    new Pixel(255, 255, 255),
    new Pixel(100, 100, 100),
    new Pixel(0, 0, 0)
  ]
  const points = dataset.slice();
  const kdt = new KDTree(points, ['red', 'green', 'blue']);
  const nn = kdt.findNN(new Pixel(111, 111, 111))
  if ( nn != dataset[1] ) {
    throw new Error('failed');
  }
})();

console.log('All Tests were passed');