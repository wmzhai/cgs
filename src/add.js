var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');
var chalk = require('chalk');
var graphql = require('graphql');

module.exports = function (inputSchemaFile) {
  console.log('add from inputSchema ' + inputSchemaFile);

  const inputSchemaStr = fs.readFileSync(inputSchemaFile, 'utf8');
  const inputSchema = graphql.parse(inputSchemaStr);
  console.log(inputSchema);

}