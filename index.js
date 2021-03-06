#!/usr/bin/env babel-node

'use strict';

var chalk = require('chalk');
var cgs = require('./src/index.js');
var minimist = require('minimist');

//Check Nodejs Version
var currentNodeVersion = process.versions.node
if (currentNodeVersion.split('.')[0] < 4) {
    console.error(
        chalk.red(
            'You are running Node ' + currentNodeVersion + '.\n' +
            'Create React App requires Node 4 or higher. \n' +
            'Please update your version of Node.'
        )
    );
    process.exit(1);
}

const argv = minimist(process.argv.slice(2));
const commands = argv._;

if (commands[0] === 'init') {
    var projectName = commands[1];
    if (!projectName) {
        usage();
    }

    cgs.init(projectName);
} else if (commands[0] === 'add') {
    const inputSchemaFile = commands[1];
    if (!inputSchemaFile) {
        usage();
    }
    
    cgs.add(inputSchemaFile);
} else if (commands[0] === 'gen') {
    const inputDir = commands[1];
    const outputDir = commands[2];
    if (!inputDir || !outputDir) {
        usage();
    }
    
    cgs.gen(inputDir,outputDir);
} else {
    usage();
}

function usage() {
    console.log('Usage: cgs <command> <arg>, where command is:');
    console.log(' -- cgs init projectName');
    console.log(' -- cgs add path/to/type.graphql');
    console.log(' -- cgs gen inputDir outputDir');
    process.exit(1);
}