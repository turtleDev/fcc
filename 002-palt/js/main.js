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

function time(fn) {
  const startTime = +new Date();
  fn();
  return +new Date - startTime;
}

function main(config) {
  const palette = loadPixelFile(config.paletteFile);
  const image = loadPixelFile(config.imageFile);

  const method = new config.method;
  let result;

  const initTime = time(() => {
    method.init(palette);
  })
  const runTime = time(() => {
    result = method.run(image);
  })
  console.error(`init: ${initTime} ms`);
  console.error(`run: ${runTime} ms (${(runTime/image.length).toFixed(5)} ms per pixel)`)
  if ( !config.dry ) {
    console.log(result.join('\n'));
  }
}

module.exports = main;
