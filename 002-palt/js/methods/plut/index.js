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
    let pixel;
    let rg, rb, gb;
    let d1, d2, d3;
    const { RGLut, RBLut, GBLut } = this; 
    const { palette } = this;
    for ( let i = 0; i < image.length; ++i ) {
      pixel = image[i];
      rg = RGLut[pixel.red][pixel.green];
      rb = RBLut[pixel.red][pixel.blue];
      gb = GBLut[pixel.green][pixel.blue];

      d1 = palette[rg].distance(pixel);
      d2 = palette[rb].distance(pixel);
      d3 = palette[gb].distance(pixel);

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