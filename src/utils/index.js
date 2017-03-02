var fs = require('fs');
var graphql = require('graphql');
var recast = require('recast');
var babylon = require('babylon');

const SCALAR_TYPE_NAMES = ['Int', 'Float', 'String', 'Boolean', 'ID'];

function isScalarType(type) {
  return SCALAR_TYPE_NAMES.includes(type.name.value);
}

function isScalarField(field) {
  return SCALAR_TYPE_NAMES.includes(getBaseType(field.type).name.value);
}

const babylonParser = {
  parse(code) {
    return babylon.parse(code, { sourceType: 'module' });
  },
};

//返回实际类型，如果是数组或者NonNull，取出里面的类型
function getBaseType(type) {
  if (type.kind === 'ListType' || type.kind === 'NonNullType') {
    return getBaseType(type.type);
  }
  return type;
}

function argumentsToObject(argumentsAst) {
  const result = {};
  argumentsAst.forEach((argument) => {
    result[argument.name.value] = argument.value.value;
  });
  return result;
}

function generatePerField(type, generators) {
  const TypeName = type.name.value;
  const typeName = lcFirst(TypeName);

  return type.fields.filter(f => !isScalarField(f)).map((field) => {
    const ReturnTypeName = getBaseType(field.type).name.value;

    // find the first directive on the field that has a generator
    const directive = field.directives.find(d => !!generators[d.name.value]);
    const fieldName = field.name.value;

    if (directive) {
      const generator = generators[directive.name.value];
      const options = argumentsToObject(directive.arguments);
      return generator({ TypeName, typeName, fieldName, ReturnTypeName }, options);
    }

    // XXX: chances are we'll want to change this but this works for now
    const isArrayField = field.type.kind === 'ListType';
    const generator = isArrayField ? generators.belongsToMany : generators.belongsTo;
    return generator({ TypeName, typeName, fieldName, ReturnTypeName }, { as: fieldName });
  });
}

function lcFirst(str) {
  return str[0].toLowerCase() + str.substring(1);
}


// Take a template, replacing each replacement.
function templateToAst(template, replacements) {
  const source = Object.keys(replacements).reduce(
    (string, key) => string.replace(new RegExp(key, 'g'), replacements[key]),
    template
  );

  return recast.parse(source, { parser: babylonParser });
}

exports.templateToAst = templateToAst;
exports.lcFirst = lcFirst;
exports.getBaseType = getBaseType;
exports.isScalarType = isScalarType;
exports.generatePerField = generatePerField;