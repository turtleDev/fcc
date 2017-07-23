'use strict';

const Pixel = require('../../pixel');

/**
 * @class Node
 */
class Node {
  /**
   * constructor
   * @param {Number} value 
   * @param {Node} left 
   * @param {Node} right 
   */
  constructor(value, left, right) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

/**
 * @class KDTree
 */
class KDTree {
  /**
   * constructor
   * @param {Pixel[]} points dataset
   * @param {String[]} planes planes to split on (property name)
   */
  constructor(points, planes) {

    function build(points, depth = 0) {

      if (points.length === 0) {
        return null;
      }

      if ( points.length == 1 ) {
        return new Node(points[0], null, null);
      }

      const planeIdx = depth % planes.length;
      const plane = planes[planeIdx];
      points.sort((x, y) => x[plane] - y[plane]);

      const medianIdx = Math.floor(points.length / 2);
      const median = points[medianIdx];

      /**
       * points smaller than the current node lie in the
       * left subtree, while points _greater than or equal_
       * to the current node lie on the right subtree.
       */
      const left = points.filter(point => point[plane] < median[plane]);
      const right = points.filter(point => point[plane] >= median[plane]);

      return new Node(
        median,
        build(left, depth + 1),
        build(right, depth + 1),
      );
    }
    this.tree = build(points);
    this.planes = planes;
  }

  /**
   * find the nearest point to the target.
   * 
   * This is not a true nearest neighbour search, just FYI
   * @param {Pixel} target 
   * @return {Pixel}
   */
  findNN(target) {
    let depth = 0;
    let node = this.tree;
    let planes = this.planes;
    let planeIdx, plane;
    while ( true ) {
      planeIdx = depth % planes.length;
      plane = planes[planeIdx];

      // increment depth
      depth++;

      if ( node.left && target[plane] < node.value[plane] ) {
        node = node.left;
      } else if ( node.right ) {
        node = node.right
      } else {
        return node.value;
      }
    }
  }
}

module.exports = KDTree;