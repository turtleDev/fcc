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
    let pixel, other;
    let rg, rb, gb;
    let d1, d2, d3;
    let tmp;
    const { RGLut, RBLut, GBLut } = this; 
    const { palette } = this;
    const { sqrt, pow, abs } = Math;
    for ( let i = 0; i < image.length; ++i ) {
      pixel = image[i];
      rg = RGLut[pixel.red][pixel.green];
      rb = RBLut[pixel.red][pixel.blue];
      gb = GBLut[pixel.green][pixel.blue];

      // d1 = palette[rg].distance(pixel);
      // d2 = palette[rb].distance(pixel);
      // d3 = palette[gb].distance(pixel);

      // inline
      tmp = palette[rg];
      d1 = (
        Math.pow(Math.abs(tmp.red - pixel.red), 2) +
        Math.pow(Math.abs(tmp.green - pixel.green), 2) +
        Math.pow(Math.abs(tmp.blue - pixel.blue), 2)
      );

      tmp = palette[rb];
      d2 = (
        Math.pow(Math.abs(tmp.red - pixel.red), 2) +
        Math.pow(Math.abs(tmp.green - pixel.green), 2) +
        Math.pow(Math.abs(tmp.blue - pixel.blue), 2)
      );

      tmp = palette[gb];
      d3 = (
        Math.pow(Math.abs(tmp.red - pixel.red), 2) +
        Math.pow(Math.abs(tmp.green - pixel.green), 2) +
        Math.pow(Math.abs(tmp.blue - pixel.blue), 2)
      );

      if ( d1 < d2 && d1 < d3 ) {
        result[i] = rg;
      } else if( d2 < d3 ) {
        result[i] = rb;
      } else {
        result[i] = gb;
      }
    }

    return result;
  }
}

module.exports = PlutSearch;