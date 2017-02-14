#!/usr/bin/env node

'use strict';

var chalk = require('chalk');
var cgs = require('./src/index.js');

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

cgs.createGraphQLServer(projectName,program.verbose);