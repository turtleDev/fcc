'use strict';

const KDTree = require('./kd-tree');
const Pixel = require('../../pixel');

/**
 * removes duplicates
 * @param {Array<Pixel>} data 
 */
function uniq(data) {
  const result = [];
  data.forEach(datum => {
    const found = result.find(candidate => 
      candidate.red === datum.red && 
      candidate.blue === datum.blue &&
      candidate.green === datum.green
    );
    if ( !found ) {
      result.push(datum);
    }
  });
  return result;
}

/**
 * kd-tree based pseudo-nearest neighbour search
 */
class BlindNNSearch {
  constructor() {
    this.searchTree = null;
    this.palette = null;
    this.idxMap = null;
  }
  init(palette) {
    const searchSet = uniq(palette);
    this.palette = palette;
    this.searchTree = new KDTree(searchSet, ['red', 'green', 'blue']);
    this.idxMap = new Map();
    palette.forEach((palem, idx) => this.idxMap.set(palem, idx));
  }
  run(image) {
    const result = Array(image.length);
    for ( let i = 0; i < image.length; ++i ) {
      const point = this.searchTree.findNN(image[i]);
      result[i] = this.idxMap.get(point);
    }
    return result;
  }
}

module.exports = BlindNNSearch;
