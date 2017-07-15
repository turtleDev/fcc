'use strict';

const Pixel = require('../../pixel');
const PLUT = require('./plut');

/**
 * A pseudo lookup table based implementation
 * @param {Pixel[]} image 
 * @param {Pixel[]} palette 
 * @returns Number
 */
function plut(image, palette) {
  const sTime = + new Date();
  const RGLut = new PLUT(palette, ['red', 'green']);
  const RBLut = new PLUT(palette, ['red', 'blue']);
  const GBLut = new PLUT(palette, ['green', 'blue']);
  console.error('build time: ', +new Date() - sTime);

  return image.map(pixel => {
    const rg = RGLut[pixel.red][pixel.green];
    const rb = RBLut[pixel.red][pixel.blue];
    const gb = RBLut[pixel.green][pixel.blue];

    const min = [rg, rb, gb].reduce((min, cur) => {
      const d = palette[cur].distance(pixel);
      if ( d < min.distance ) {
        min.distance = d;
        min.value = cur;
      }
      return min;
    }, {
      distance: palette[rg].distance(pixel),
      value: rg
    });

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

module.exports = plut;