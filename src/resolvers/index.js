var fs = require('fs');
var recast = require('recast');
var utils = require('../utils');


module.exports = function (inputSchema) {
  console.log('generateResolver from inputSchema ' + inputSchema);
  const type = inputSchema.definitions[0];
  const TypeName = type.name.value;
  const typeName = utils.lcFirst(TypeName);

  const ast = generators.base({ TypeName, typeName });

  // XXX: rather than hardcoding in array indices it would be less brittle to
  // walk the tree using https://github.com/benjamn/ast-types
  const typeResolversAst = ast.program.body[0] // const
    .declarations[0].init // object expression
    .properties[0].value; // object value

  utils.generatePerField(type, generators).forEach((resolverFunctionAst) => {
    const resolverProperty = resolverFunctionAst.program.body[0] // variable declaration
      .declarations[0].init // object expression
      .properties[0];

    typeResolversAst.properties.push(resolverProperty);
  });

  return recast.print(ast, { trailingComma: true }).code;
}


function read(name) {
  return fs.readFileSync(`${__dirname}/templates/${name}.js`, 'utf8');
}

const templates = {
  base: read('base'),
  fieldOfType: read('fieldOfType'),
  paginatedField: read('paginatedField'),
};

function generateResolver(template) {
  return ({ TypeName, typeName, fieldName }) => {
    return utils.templateToAst(template, { typeName, TypeName, fieldName });
  };
}

const generators = {
  base({ typeName, TypeName }) {
    return utils.templateToAst(templates.base, { typeName, TypeName });
  },
  belongsTo: generateResolver(templates.fieldOfType),
  belongsToMany: generateResolver(templates.paginatedField),
  hasOne: generateResolver(templates.fieldOfType),
  hasMany: generateResolver(templates.paginatedField),
  hasAndBelongsToMany: generateResolver(templates.paginatedField),
};