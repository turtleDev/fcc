'use strict';

const Pixel = require('../../pixel');


class NearestNeighbour {
  /**
   * An interface representing the current best search candidate.
   * @param {Pixel} point 
   * @param {Number} distance 
   */
  constructor(point, distance) {
    this.point = point;
    this.distance = distance;
  }
}

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
 * 
 * The tree _does_ store points in internal nodes for lookup.
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
       * points smaller than the median/splitting node lie in the
       * left subtree, while points _greater than or equal_
       * to the current node lie on the right subtree.
       * 
       * the splitting node itself is not stored in any sub trees.
       */
      const left = points.filter(point => point[plane] < median[plane]);
      const right = points.filter(point => point[plane] >= median[plane] && point != median);

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
   * @param {Pixel} target 
   * @return {Pixel}
   */
  findNN(target) {
    const nn = new NearestNeighbour(null, -1);

    const find = (node, depth = 0) => {
      const planeIdx = depth % this.planes.length;
      const plane = this.planes[planeIdx];

      depth++;

      if ( node.left && target[plane] < node.value[plane] ) {
        find(node.left, depth);

        // is the current node closer to query?
        if ( target.distanceSquared(node.value) < nn.distance ) {
          nn.pixel = node.value;
          nn.distance = target.distanceSquared(node.value);
        }

        // should we transverse the other sub-tree?
        if ( Math.pow(target[plane] - node.value[plane], 2) < nn.distance && node.right ) {
          find(node.right, depth);
        }
      } else if ( node.right ) {

        find(node.right, depth);

        // is the current node closer to query?
        if ( target.distanceSquared(node.value) < nn.distance ) {
          nn.pixel = node.value;
          nn.distance = target.distanceSquared(node.value);
        }

        // should we transverse the other sub-tree?
        if ( Math.pow(target[plane] - node.value[plane], 2) < nn.distance && node.left ) {
          find(node.right, depth);
        }

      } else {
        if ( !nn.pixel || nn.distance > target.distanceSquared(node.value) ) {
          nn.pixel = node.value;
          nn.distance = target.distanceSquared(nn.pixel);
        }
        return;
      }
    }
    
    // begin processing the tree
    find(this.tree);

    // return the result;
    return nn.pixel;
  }
}

module.exports = KDTree;
