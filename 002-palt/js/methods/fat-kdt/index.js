'use strict';

const FatKDTree = require('./fat-kd-tree');
/**
 * kd-tree based nearest neighbour search 
 * @param {Pixel[]} image 
 * @param {Pixel[]} palette 
 * @returns {Number[]}
 */
function fatKdt(image, palette) {
  const searchTree = new FatKDTree(palette, ['red', 'green', 'blue'], 5)
  const idxMap = new Map();
  palette.map((palem, idx) => {
    idxMap.set(palem, idx);
  });
  return image.map(target => {
    const point = searchTree.findNN(target);
    return idxMap.get(point);
  })
}

module.exports = fatKdt;