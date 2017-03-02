var fs = require('fs');
var print = require('recast').print;
var { templateToAst, lcFirst, generatePerField} = require('../utils');

module.exports = function (inputSchema) {
  const type = inputSchema.definitions[0];
  const TypeName = type.name.value;
  const typeName = lcFirst(TypeName);

  const ast = generators.base({ TypeName, typeName });

  // XXX: rather than hardcoding in array indices it would be less brittle to
  // walk the tree using https://github.com/benjamn/ast-types
  const classMethodsAst = ast.program.body[2] // export
    .declaration // class declaration
    .body.body;

  const findOneMethod = classMethodsAst.find(m => m.key.name === 'all');
  let nextIndex = classMethodsAst.indexOf(findOneMethod) + 1;

  generatePerField(type, generators).forEach((resolverFunctionAst) => {
    const classMethodAst = resolverFunctionAst.program.body[0] // class declaration
      .body.body[0]; // classMethod

    classMethodsAst.splice(nextIndex, 0, classMethodAst);
    nextIndex += 1;
  });

  return print(ast, { trailingComma: true }).code;
}

function read(name) {
  return fs.readFileSync(`${__dirname}/templates/${name}.js`, 'utf8');
}

const templates = {
  base: read('base'),
  singularAssociation: read('singularAssociation'),
  paginatedAssociation: read('paginatedAssociation'),
};

const generators = {
  base({ typeName, TypeName }) {
    return templateToAst(templates.base, { typeName, TypeName });
  },
  belongsTo({ typeName, fieldName, ReturnTypeName }) {
    return templateToAst(templates.singularAssociation, {
      typeName,
      fieldName,
      ReturnTypeName,
    });
  },
  belongsToMany({ typeName, fieldName, ReturnTypeName }) {
    return templateToAst(templates.paginatedAssociation, {
      typeName,
      fieldName,
      ReturnTypeName,
      query: `_id: { $in: ${typeName}.${fieldName}Ids || [] }`,
    });
  },
  // TODO: write test and implement
  // hasOne({ typeName, fieldName, ReturnTypeName }, { as }) {
  //   return templateToAst(templates.singularAssociation, {
  //     typeName,
  //     fieldName,
  //     ReturnTypeName,
  //   });
  // },
  hasMany({ typeName, fieldName, ReturnTypeName }, { as = typeName }) {
    return templateToAst(templates.paginatedAssociation, {
      typeName,
      fieldName,
      ReturnTypeName,
      query: `${as}Id: ${typeName}._id`,
    });
  },
  hasAndBelongsToMany({ typeName, fieldName, ReturnTypeName }, { as = typeName }) {
    return templateToAst(templates.paginatedAssociation, {
      typeName,
      fieldName,
      ReturnTypeName,
      query: `${as}Ids: ${typeName}._id`,
    });
  },
};