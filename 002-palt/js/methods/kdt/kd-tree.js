'use strict';

/**
 * @class Node
 */
class Node {
  /**
   * constructor
   * @param {Number} value 
   * @param {Node} left 
   * @param {Node} right 
   * @param {Boolean} leaf 
   */
  constructor(value, left, right, leaf = false) {
    this.value = value;
    this.left = left;
    this.right = right;
    this.leaf = leaf;
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
        return new Node(points[0], null, null, true);
      }

      const planeIdx = depth % planes.length;
      const plane = planes[planeIdx];
      points.sort((x, y) => x[plane] - y[plane]);

      const medianIdx = Math.floor(points.length / 2);
      const median = points[medianIdx];

      const left = points.slice(0, medianIdx);
      const right = points.slice(medianIdx);
      return new Node(
        median,
        build(left, depth + 1),
        build(right, depth + 1),
      );
    }
    this.tree = build(points);
  }
}

module.exports = KDTree;