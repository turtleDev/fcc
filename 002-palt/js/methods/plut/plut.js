'use strict';


function distance2d(x1, y1, x2, y2) {
  return Math.sqrt(
    Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
  );
}

function findIdx(dataset, axes, values) {
  const [ row, col ] = axes;
  const [ y, x ] = values;
  let idx = 0;
  let min = distance2d(
    dataset[0][col], dataset[0][row], x, y
  );
  for ( let i = 1; i < dataset.length; ++i ) {
    const datum = dataset[i];
    const d = distance2d(
      dataset[i][col], dataset[i][row], x, y
    )
    if ( d < min ) {
      min = d;
      idx = i;
    }
  }
  return idx;
}

class PLUT extends Array {
  /**
   * a pseudo lookup table in 2d space
   * @param {Pixel[]} data 
   * @param {String[2]} axes 
   */
  constructor(data, axes) {
    super();
    if ( axes.length != 2 ) {
      throw new Error('please specify atleast 2 axes')
    }
    const [row, col] = axes;
    for (let i = 0; i < data.length; ++i ) {
      let line = [];
      for ( let j = 0; j < data.length; ++j ) {
        line.push(findIdx(data, axes, [i, j]))
      }
      this.push(line);
    }
  }
}

module.exports = PLUT;