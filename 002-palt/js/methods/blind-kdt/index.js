'use strict';

const KDTree = require('./kd-tree');
const { uniq } = require('../../utils');

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
