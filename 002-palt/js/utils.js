'use strict'

/**
 * removes duplicates
 * @param {Array<Pixel>} data 
 */
exports.uniq = function uniq(data) {
  const result = [];
  data.forEach(datum => {
    const found = result.find(candidate => 
      candidate.red === datum.red && 
      candidate.blue === datum.blue &&
      candidate.green === datum.green
    );
    if ( !found ) {
      result.push(datum);
    }
  });
  return result;
}
