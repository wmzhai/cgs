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
  const inputSchemaStr = fs.readFileSync(inputSchemaFile, 'utf8');
  const inputSchema = graphql.parse(inputSchemaStr);

  const type = inputSchema.definitions[0];
  const TypeName = type.name.value;
  const typeName = utils.lcFirst(TypeName);

  const outputSchemaStr = generateSchema(inputSchema);
  const resolversStr = generateResolvers(inputSchema);
  const modelStr = generateModel(inputSchema);

  //TODO we need to check the exist of schema directory before write file
  
  
  fs.writeFileSync(path.join('schema', `${typeName}.graphql`), outputSchemaStr);
  fs.writeFileSync(path.join('resolvers', `${typeName}.js`), resolversStr);
  fs.writeFileSync(path.join('model', `${typeName}.js`), modelStr);

  fs.appendFileSync(path.join('schema', 'index.js'),
    `\ntypeDefs.push(requireGraphQL('./${typeName}.graphql'));\n`
  );

  fs.appendFileSync(path.join('resolvers', 'index.js'),
    `\nimport ${typeName}Resolvers from './${typeName}';\n` +
    `merge(resolvers, ${typeName}Resolvers);\n`
  );

  fs.appendFileSync(path.join('model', 'index.js'),
    `\nimport ${TypeName} from './${typeName}';\n` +
    `models.${TypeName} = ${TypeName};\n`
  );
}