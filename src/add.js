var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');
var chalk = require('chalk');
var graphql = require('graphql');
var generateSchema = require('./schema');
var capitalization = require('./utils/capitalization');

module.exports = function (inputSchemaFile) {
  console.log('add from inputSchemaFile ' + inputSchemaFile);

  const inputSchemaStr = fs.readFileSync(inputSchemaFile, 'utf8');
  const inputSchema = graphql.parse(inputSchemaStr);
  console.log(inputSchema);

  const type = inputSchema.definitions[0];
  console.log('type:' + type);
  const TypeName = type.name.value;
  console.log('TypeName:' + TypeName);
  const typeName = capitalization.lcFirst(TypeName);
  console.log('typeName:' + typeName);

  const outputSchema = generateSchema(inputSchema);
  const outputSchemaStr = graphql.print(outputSchema);

  var outputSchemaPath = path.join('schema', `${typeName}.graphql`);
  // console.log(outputSchemaPath);
  // console.log(outputSchemaStr);


  fs.writeFileSync(outputSchemaPath, outputSchemaStr);

}