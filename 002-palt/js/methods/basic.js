'use strict';

const Pixel = require('../pixel');

/**
 * a simple approach using linear search
 * @class Basic
 */
class Basic {
  constructor() { this.palette = null; }
  init(palette) { this.palette = palette }
  run(image) {
    const result = Array(image.length);
    for ( let i = 0; i < image.length; ++i ) {
      const pixel = image[i];
      let idx = 0;
      let value = pixel.distance(this.palette[0]);
      for ( let j = 0; j < this.palette.length; ++j ) {
        const d =  pixel.distance(this.palette[j]);
        if ( d < value ) {
          idx = j;
          value = d;
        }
      }
      result[i] = idx;
    }
    return result;
  }
}

module.exports = Basic;