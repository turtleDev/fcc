'use strict';

const Pixel = require('../../pixel');

/**
 * @class Node
 */
class Node {
  /**
   * constructor
   * @param {Pixel} value 
   * @param {Node} left 
   * @param {Node} right 
   * @param {Pixel[] | null} dataset
   */
  constructor(value, left, right, dataset = null) {
    this.value = value;
    this.left = left;
    this.right = right;
    this.dataset = dataset;
  }
}

/**
 * @class KDTree
 */
class FatKDTree {
  /**
   * constructor
   * @param {Pixel[]} points dataset
   * @param {String[]} planes planes to split on (property name)
   * @param {Number} depth maximum height of the tree
   */
  constructor(points, planes, maxDepth = 10) {

    function build(points, depth = 0) {

      if (points.length === 0) {
        return null;
      }

      if ( depth === maxDepth ) {
        return new Node(points[0], null, null, points);
      }

      if ( points.length === 1 ) {
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
    this.maxDepth = maxDepth;
  }

  /**
   * find the nearest point to the target
   * @param {Pixel} target 
   * @return {Pixel}
   */
  findNN(target) {
    // const find = (node, planes, depth = 0) => {
    //   const planeIdx = depth % planes.length;
    //   const plane = planes[planeIdx];

    //   if ( depth === this.maxDepth ) {

    //     const { dataset } = node;
    //     let idx = 0;
    //     let min = dataset[0].distance(target);
    //     for ( let i = 1; i < dataset.length; ++i ) {
    //       const d = dataset[i].distance(target);
    //       if ( d < min ) {
    //         idx = i;
    //         min = d;
    //       }
    //     }
    //     return dataset[idx];

    //   } else if ( node.left && target[plane] < node.value[plane] ) {
    //     return find(node.left, planes, depth + 1);
    //   } else if ( node.right ) {
    //     return find(node.right, planes, depth + 1);
    //   } else {
    //     return node.value;
    //   }
    // };
    // return find(this.tree, this.planes);

    let depth = 0;
    let node = this.tree;
    let planes = this.planes;
    const maxDepth = this.maxDepth;
    let planeIdx, plane;

    while ( true ) {
      planeIdx = depth % planes.length;
      plane = planes[planeIdx];

      if ( depth === maxDepth ) {
        const { dataset } = node;
        let idx = 0;
        let min = dataset[0].distance(target);
        for ( let i = 1; i < dataset.length; ++i ) {
          const d = dataset[i].distance(target);
          if ( d < min ) {
            idx = i;
            min = d;
          }
        }
        return dataset[idx];

      }
      
      depth++;

      if ( node.left && target[plane] <= node.value[plane] ) {
        node = node.left;
      } else if ( node.right ) {
        node = node.right
      } else {
        return node.value;
      }
    }
  }
}

module.exports = FatKDTree;