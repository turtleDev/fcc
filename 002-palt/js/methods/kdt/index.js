'use strict';

const KDTree = require('./kd-tree');

/**
 * kd-tree based nearest neighbour search 
 */
class NNSearch {
  constructor() {
    this.searchTree = null;
    this.palette = null
  }
  init(palette) {
    this.searchTree = new KDTree(palette, ['red', 'green', 'blue']);
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

module.exports = NNSearch;
