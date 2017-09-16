'use strict';

const Pixel = require('../pixel');

/**
 * A stub implementation.
 * useful for setting a benchmark on the upperlimit
 * for runtime
 * @class none
 */
class none {
  init() {}
  run(image) {
    const results = Array(image.length);
    for ( let i = 0; i < results.length; ++i ) {
      results[i] = Math.floor(image.length * Math.random());
    }
    return results;
  }
}

module.exports = none;