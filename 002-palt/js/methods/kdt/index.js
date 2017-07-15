'use strict';

const KDTree = require('./kd-tree');
/**
 * kd-tree based nearest neighbour search 
 * @param {Pixel[]} image 
 * @param {Pixel[]} palette 
 * @returns {Number[]}
 */
function kdt(image, palette) {
  const searchTree = new KDTree(palette, ['red', 'green', 'blue'])
  const idxMap = new Map();
  palette.map((palem, idx) => {
    idxMap.set(palem, idx);
  });
  return image.map(target => {
    const point = searchTree.findNN(target);
    return idxMap.get(point);
  })
}

module.exports = kdt;