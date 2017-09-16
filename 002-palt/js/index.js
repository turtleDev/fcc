'use strict';

const Path = require('path')

const main = require('./main');
const methods = require('./methods');

const programName = Path.basename(process.argv[1]);

if ( require.main == module ) {
  let config = require('yargs')
  .usage(`usage: ${programName} --method <method> [options] palette-file image-file`)
  .demandOption('method')
  .choices('method', methods)
  .boolean('dry')
  .describe('dry', 'don\'t produce out. useful for lookin at stats.')
  .demandCommand(2, 'error: insufficent arguments')
  .epilog('License: Public Domain')
  .help('help')
  .argv

  const method = require(Path.join(__dirname, 'methods', config.method));
  const [ paletteFile, imageFile ] = config._;
  config = Object.assign(config, { paletteFile, imageFile, method});
  process.exit(main(config));
}