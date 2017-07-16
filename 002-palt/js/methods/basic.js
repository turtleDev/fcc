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
    return image.map(pixel => {
      let idx = 0;
      let value = pixel.distance(this.palette[0]);
      for ( let i = 0; i < this.palette.length; ++i ) {
        const d =  pixel.distance(this.palette[i]);
        if ( d < value ) {
          idx = i;
          value = d;
        }
      }
      return idx;
    });
  }
}

module.exports = Basic;