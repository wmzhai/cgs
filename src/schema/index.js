var assert = require('assert');
var graphql = require('graphql');
var cloneDeep = require('lodash.clonedeep');
var { SCALAR_TYPE_NAMES, lcFirst} = require('../utils');

module.exports = function (inputSchema) {
  // Check that the input looks like we expect -- a single ObjectType definition
  assert(inputSchema.kind === 'Document');
  assert(inputSchema.definitions.length === 1);

  const outputSchema = cloneDeep(inputSchema);
  const type = outputSchema.definitions[0];
  const TypeName = type.name.value;
  const typeName = lcFirst(TypeName);

  const createInputFields = [];
  const updateInputFields = [];

  type.fields.forEach((field) => {
    let unmodifiable = false;
    field.directives.forEach((directive) => {
      const directiveGenerator = directiveGenerators[directive.name.value];
      if (directive.name.value === 'unmodifiable') {
        unmodifiable = true;
      }
      if (directiveGenerator) {
        directiveGenerator(type, field, directive.arguments);
      }
    });

    // XXX: Not sure if this the correct logic but it makes my tests pass
    // TODO: check for @unmodifiable
    let possibleInputType = field.type;
    let inputTypeModifier = '';
    if (possibleInputType.kind === 'NonNullType') {
      possibleInputType = possibleInputType.type;
      inputTypeModifier = '!';
    }

    if (possibleInputType.kind === 'NamedType') {
      let inputField;
      if (SCALAR_TYPE_NAMES.includes(possibleInputType.name.value)) {
        inputField = field;
      } else {
        inputField = buildField(`${field.name.value}Id`, [], `ObjID${inputTypeModifier}`);
      }

      createInputFields.push(inputField);
      if (!unmodifiable) {
        updateInputFields.push(inputField);
      }
    }

    field.directives = [];
  });


  type.fields.unshift(buildField('id', [], 'ObjID!'));
  type.fields.push(buildField('createdAt', [], 'Float!'));
  type.fields.push(buildField('updatedAt', [], 'Float!'));

  const queryOneField = buildField(typeName, [idArgument()], TypeName);
  const queryAllField = buildField(`${typeName}s`, paginationArguments(), `[${TypeName}!]`);
  outputSchema.definitions.push(
    buildTypeExtension(buildTypeDefinition('Query', [queryAllField, queryOneField]))
  );

  const createInputTypeName = `Create${TypeName}Input`;
  outputSchema.definitions.push(
    buildTypeDefinition(createInputTypeName, createInputFields, 'InputObjectTypeDefinition')
  );

  const updateInputTypeName = `Update${TypeName}Input`;
  outputSchema.definitions.push(
    buildTypeDefinition(updateInputTypeName, updateInputFields, 'InputObjectTypeDefinition')
  );

  // Create update input type if readonly fields

  outputSchema.definitions.push(buildTypeExtension(
    buildTypeDefinition('Mutation', [
      buildField(`create${TypeName}`, [
        buildArgument('input', `${createInputTypeName}!`),
      ], TypeName),

      buildField(`update${TypeName}`, [
        idArgument(),
        buildArgument('input', `${updateInputTypeName}!`),
      ], TypeName),

      buildField(`remove${TypeName}`, [idArgument()], 'Boolean'),
    ])
  ));

  return graphql.print(outputSchema);
}


function buildName(name) {
  return { kind: 'Name', value: name };
}

function buildTypeDefinition(name, fields, kind = 'ObjectTypeDefinition') {
  return {
    kind,
    name: buildName(name),
    interfaces: [],
    directives: [],
    fields,
  };
}

function buildTypeExtension(type) {
  return {
    kind: graphql.Kind.TYPE_EXTENSION_DEFINITION,
    definition: type,
  };
}

function buildTypeReference(name) {
  if (name[name.length - 1] === '!') {
    return {
      kind: 'NonNullType',
      type: buildTypeReference(name.substring(0, name.length - 1)),
    };
  }

  if (name[0] === '[' && name[name.length - 1] === ']') {
    return {
      kind: 'ListType',
      type: buildTypeReference(name.substring(1, name.length - 1)),
    };
  }

  return {
    kind: 'NamedType',
    name: buildName(name),
  };
}

function buildField(name, args, TypeName) {
  return {
    kind: 'FieldDefinition',
    name: buildName(name),
    arguments: args,
    type: buildTypeReference(TypeName),
  };
}

function buildArgument(name, type) {
  return {
    kind: 'InputValueDefinition',
    name: buildName(name),
    type: buildTypeReference(type),
    defaultValue: null,
    directives: [],
  };
}

function paginationArguments() {
  return [
    buildArgument('lastCreatedAt', 'Float'),
    buildArgument('limit', 'Int'),
  ];
}

function idArgument() {
  return buildArgument('id', 'ObjID!');
}

const directiveGenerators = {
  // XXX: check that field.type is an array type?
  hasMany(type, field) {
    field.arguments = paginationArguments();
  },
  hasAndBelongsToMany(type, field) {
    field.arguments = paginationArguments();
  },
  belongsToMany(type, field) {
    field.arguments = paginationArguments();
  },
};
