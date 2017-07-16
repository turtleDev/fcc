'use strict';

const FatKDTree = require('./fat-kd-tree');
/**
 * kd-tree based nearest neighbour search 
 * @param {Pixel[]} image 
 * @param {Pixel[]} palette 
 * @returns {Number[]}
 */

class FatNNSearch {
  constructor() {
    this.searchTree = null;
    this.palette = null
  }
  init(palette) {
    this.searchTree = new FatKDTree(palette, ['red', 'green', 'blue'], 5);
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

module.exports = FatNNSearch;