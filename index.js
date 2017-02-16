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

var commander = require('commander');
var projectName;

var program = commander
    .version(require('./package.json').version)
    .arguments('<project-directory>')
    .usage(chalk.green('<project-directory>') + ' [options]')
    .action(function (name) {
        projectName = name;
    })
    .option('-v, --verbose', 'print additional logs')
    .allowUnknownOption()
    .parse(process.argv);

if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:');
    console.log('  ' + chalk.cyan(program.name()) + chalk.green(' <project-directory>'));
    console.log();
    console.log('For example:');
    console.log('  ' + chalk.cyan(program.name()) + chalk.green(' my-graphql-server'));
    console.log();
    console.log('Run ' + chalk.cyan(program.name() + ' --help') + ' to see all options.');
    process.exit(1);
}


function usage() {
    console.log('Usage: cgs <command> <arg>, where command is:');
    console.log(' - cgs init projectName');
    console.log(' - cgs add path/to/type.graphql');
    process.exit(1);
}


const argv = minimist(process.argv.slice(2));

const commands = argv._;
console.log('commands: ' + commands);

if (commands[0] === 'init') {
    const projectName = commands[1];
    if (!projectName) {
        usage();
    }

    cgs.createGraphQLServer(projectName);
} else if (commands[0] === 'add') {

} else {
    usage();
}

