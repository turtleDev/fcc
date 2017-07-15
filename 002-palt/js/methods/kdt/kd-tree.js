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

      /**
       * points smaller than the current node lie in the
       * left subtree, while points _greater than or equal_
       * to the current node lie on the right subtree.
       */
      const left = points.slice(0, medianIdx);
      const right = points.slice(medianIdx);

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
   * find the nearest point to the target
   * @param {Pixel} target 
   * @return {Pixel}
   */
  findNN(target) {
    function find(node, planes, depth = 0) {
      const planeIdx = depth % planes.length;
      const plane = planes[planeIdx];
      if ( node.left && target[plane] < node.value[plane] ) {
        return find(node.left, planes, depth + 1);
      } else if ( node.right ) {
        return find(node.right, planes, depth + 1);
      } else {
        return node.value;
      }
    }
    return find(this.tree, this.planes);
  }
}

module.exports = KDTree;