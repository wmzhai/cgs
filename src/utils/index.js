var fs = require('fs');
var graphql = require('graphql');
var recast = require('recast');
var babylon = require('babylon');

const SCALAR_TYPE_NAMES = ['Int', 'Float', 'String', 'ID'];
const babylonParser = {
  parse(code) {
    return babylon.parse(code, { sourceType: 'module' });
  },
};

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

function isScalarField(field) {
  return SCALAR_TYPE_NAMES.includes(getBaseType(field.type).name.value);
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

function ucFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function readInput(path) {
  return graphql.parse(fs.readFileSync(path, 'utf8'));
}

// Take a template, replacing each replacement.
function templateToAst(template, replacements) {
  const source = Object.keys(replacements).reduce(
    (string, key) => string.replace(new RegExp(key, 'g'), replacements[key]),
    template
  );

  return recast.parse(source, { parser: babylonParser });
}

exports.readInput = readInput;
exports.templateToAst = templateToAst;
exports.lcFirst = lcFirst;
exports.ucFirst = ucFirst;
exports.getBaseType = getBaseType;
exports.argumentsToObject = argumentsToObject;
exports.isScalarField = isScalarField;
exports.generatePerField = generatePerField;
