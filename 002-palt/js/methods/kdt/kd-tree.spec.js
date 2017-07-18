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
  const nn = kdt.findNN(new Pixel(2, 2, 2))
  if ( nn != dataset[2] ) {
    throw new Error('failed');
  }
})();

(function evenLessSimpleTest() {
  const p = (v) => new Pixel(v, v ,v);
  const dataset = [
    p(1),
    p(3),
    p(4),
    p(3),
    p(123),
    p(4),
    p(12),
    p(1),
    p(23),
    p(4),
    p(1),
    p(223),
    p(4),
    p(3),
    p(41),
    p(23),
    p(123),
    p(42),
    p(213),
    p(32),
    p(23),
    p(32),
    p(4),
    p(54),
    p(65),
    p(3),
    p(23),
    p(43),
    p(47),
    p(65)
  ];

  const points = dataset.slice();
  const kdt = new KDTree(points, ['red', 'green', 'blue']);
  const idx = Math.floor(dataset.length * Math.random());
  const result = kdt.findNN(dataset[idx]);
  if ( JSON.stringify(dataset[idx]) != JSON.stringify(result) ) {
    console.log('original pixel', dataset[idx]);
    console.log('pixel found', result);
    throw new Error('failed');
  }
})();

console.log('All Tests were passed');