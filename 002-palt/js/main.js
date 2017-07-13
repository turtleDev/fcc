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
  .split('\n')
  .filter(x => x)
  .map(row => {
    const [r, g, b] = row.split(' ').map(Number);
    return new Pixel(r, g, b);
  })
}

if ( require.main === module ) {
  const { argv } = process;
  if ( argv.length != 4 ) {
    const programName = Path.basename(argv[1]);
    console.error(`usage: ${programName} palette-file image-file`);
    process.exit(-1);
  }

  const paletteSource = argv[2];
  const imageSource = argv[3];

  const palette = loadPixelFile(paletteSource);
  const image = loadPixelFile(imageSource);
  const result = image.map(pixel => {
    let idx = 0;
    let value = pixel.distance(palette[0]);
    for ( let i = 0; i < palette.length; ++i ) {
      const d =  pixel.distance(palette[i]);
      if ( d < value ) {
        idx = i;
        value = d;
      }
    }
    return idx;
  });

  console.log(result.join('\n'));
}
