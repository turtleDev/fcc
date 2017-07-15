#!/usr/bin/env node
'use strict';

const Path = require('path');
const Fs = require('fs');

const Pixel = require('./pixel');

/**
 * load pixel data from a file
 * @param {String} source path to source file
 * @returns {Array}
 */
function loadPixelFile(source) {
  return Fs.readFileSync(source)
  .toString()
  .match(/(.+)/g)
  .map(row => {
    const [_, r, g, b] = /(\d+) (\d+) (\d+)/.exec(row);
    return new Pixel(+r, +g, +b);
  })
}

function main(config) {
  const palette = loadPixelFile(config.paletteFile);
  const image = loadPixelFile(config.imageFile);
  const starttime = +new Date();
  const result = config.method(image, palette);
  const endtime = +new Date();
  const runtime = endtime - starttime;
  console.error(`${runtime} ms elapsed`);
  console.error(`${runtime/image.length} ms per pixel`)
  console.log(result.join('\n'));
}

module.exports = main;
