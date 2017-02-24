'use strict';

var chalk = require('chalk');

module.exports = function (inputDir, outputDir) {
  console.log( 'gen project from ' + chalk.cyan(inputDir) + ' to ' + chalk.cyan(outputDir));
}