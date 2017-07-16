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
    return image.map(target => {
      const point = this.searchTree.findNN(target);
      return this.idxMap.get(point);
    });
  }
}

module.exports = NNSearch;