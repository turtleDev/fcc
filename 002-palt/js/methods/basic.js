'use strict';

const Pixel = require('../pixel');

/**
 * a simple approach using linear search
 * @param {Pixel[]} image 
 * @param {Pixel[]} palette 
 * @returns {Number[]}
 */
function basic(image, palette) {
  return image.map(pixel => {
    let idx = 0;
    let value = pixel.distance(palette[0]);
    for ( let i = 0; i < palette.length; ++i ) {
      const d =  pixel.distance(palette[i]);
      if ( d < value ) {
        idx = i;
        value = d;
      }
    }
    return idx;
  });
}

module.exports = basic;