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
    return image.map(pixel => {
      const rg = this.RGLut[pixel.red][pixel.green];
      const rb = this.RBLut[pixel.red][pixel.blue];
      const gb = this.RBLut[pixel.green][pixel.blue];

      const min = [rg, rb, gb].reduce((min, cur) => {
        const d = this.palette[cur].distance(pixel);
        if ( d < min.distance ) {
          min.distance = d;
          min.value = cur;
        }
        return min;
      }, {
        distance: this.palette[rg].distance(pixel),
        value: rg
      });

      return min.value;

      // a faster, less accurate alternative
      //
      // const d1 = palette[rg].distance(pixel);
      // const d2 = palette[rb].distance(pixel);
      // const d3 = palette[gb].distance(pixel);

      // if ( d1 < d2 && d1 < d3 ) {
      //   return rg;
      // }

      // if( d2 < d1 && d2 < d3 ) {
      //   return rb;
      // }

      // if ( d3 < d1 && d3 < d2 ) {
      //   return gb;
      // }

      // return rb;
    });
  }
}

module.exports = PlutSearch;