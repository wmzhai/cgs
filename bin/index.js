#!/usr/bin/env node

const chalk = require('chalk');

var lib= require('../lib/index.js');
var greeting = lib.sayHello('GraphQL Server');

console.log(chalk.green(greeting));