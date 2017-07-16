'use strict';

const Pixel = require('../../pixel');
const PLUT = require('./plut');

/**
 * A pseudo lookup table based implementation
 */
class PlutSearch {
  constructor() {
    this.RGLut = null;
    this.RBLut = null;
    this.GBLut = null;
    this.palette = null;
  }
  init(palette) {
    this.RGLut = new PLUT(palette, ['red', 'green']);
    this.RBLut = new PLUT(palette, ['red', 'blue']);
    this.GBLut = new PLUT(palette, ['green', 'blue']);
    this.palette = palette;
  }

  run(image) {
    const result = Array(image.length);
    for ( let i = 0; i < image.length; ++i ) {
      const pixel = image[i];
      const rg = this.RGLut[pixel.red][pixel.green];
      const rb = this.RBLut[pixel.red][pixel.blue];
      const gb = this.RBLut[pixel.green][pixel.blue];

      const d1 = this.palette[rg].distance(pixel);
      const d2 = this.palette[rb].distance(pixel);
      const d3 = this.palette[gb].distance(pixel);

      if ( d1 < d2 && d1 < d3 ) {
        result[i] = rg;
      } else if( d2 < d1 && d2 < d3 ) {
        result[i] = rb;
      } else if ( d3 < d1 && d3 < d2 ) {
        result[i] = gb;
      } else {
        result[i] = rb;
      }
    }

    return result;
  }
}

module.exports = PlutSearch;