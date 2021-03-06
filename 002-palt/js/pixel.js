'use strict';

/**
 * @class Pixel
 */
class Pixel {
  /**
   * constructor
   * @param {Number} red 
   * @param {Number} green 
   * @param {Number} blue 
   */
  constructor(red, green, blue) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  /**
   * return the distance between 2 pixel(s)
   * @param {Pixel} other 
   * @returns {Number}
   */
  distance(other) {
    return Math.sqrt(
      Math.pow(Math.abs(this.red - other.red), 2) +
      Math.pow(Math.abs(this.green - other.green), 2) +
      Math.pow(Math.abs(this.blue - other.blue), 2)
    );
  }

  /**
   * return the squared distance between 2 pixel(s)
   * @param {Pixel} other 
   * @returns {Number}
   */
  distanceSquared(other) {
    return (
      Math.pow(Math.abs(this.red - other.red), 2) +
      Math.pow(Math.abs(this.green - other.green), 2) +
      Math.pow(Math.abs(this.blue - other.blue), 2)
    );
  }
}

module.exports = Pixel;