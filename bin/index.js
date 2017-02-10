#!/usr/bin/env node
 
var lib= require('../lib/index.js');
var greeting = lib.sayHello('GraphQL Server');
 
console.log(greeting);