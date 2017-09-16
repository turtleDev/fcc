'use strict';

const Fs = require('fs');

module.exports = (function() {
  return Fs.readdirSync(__dirname)
  .map(file => file.replace(/\.js$/, ''))
  .filter(file => file !== 'index');
})();