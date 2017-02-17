var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');
var chalk = require('chalk');
var graphql = require('graphql');
var generateSchema = require('./schema');
var generateResolvers = require('./resolvers');
var generateModel = require('./model');
var utils = require('./utils');

module.exports = function (inputSchemaFile) {
  console.log('add from inputSchemaFile ' + inputSchemaFile);

  const inputSchemaStr = fs.readFileSync(inputSchemaFile, 'utf8');
  const inputSchema = graphql.parse(inputSchemaStr);
  console.log(inputSchema);

  const type = inputSchema.definitions[0];
  console.log('type:' + type);
  const TypeName = type.name.value;
  console.log('TypeName:' + TypeName);
  const typeName = utils.lcFirst(TypeName);
  console.log('typeName:' + typeName);

  const outputSchema = generateSchema(inputSchema);
  const outputSchemaStr = graphql.print(outputSchema);
  const resolversStr = generateResolvers(inputSchema);
  const modelStr = generateModel(inputSchema);

  //TODO we need to check the exist of schema directory before write file
  fs.writeFileSync(path.join('schema', `${typeName}.graphql`), outputSchemaStr);
  fs.writeFileSync(path.join('resolvers', `${typeName}.js`), resolversStr);
  fs.writeFileSync(path.join('model', `${TypeName}.js`), modelStr);

}