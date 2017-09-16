'use strict';

const Pixel = require('../../pixel');
const PLUT = require('./plut');

(function basicTest() {
  const data = [
    new Pixel(0, 0, 0),
    new Pixel(1, 1, 1),
    new Pixel(2, 2, 2),
    new Pixel(3, 3, 3)
  ];

  const lut = new PLUT(data, ['red', 'green']);
  for ( let i = 0; i < data.length; ++i ) {
    if ( lut[i][i] !== i ) {
      throw new Error('failed');
    }
  }
})();

console.log('All tests were passed');