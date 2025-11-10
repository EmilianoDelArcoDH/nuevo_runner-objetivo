import * as Blockly from 'blockly';

// Bloques de declaración de variables y asignación
export const variablesBlocks = [
    // Declaración de variable (asignación)
    {
      "type": "variable_declaration",
      "message0": "variable %1 = %2",
      "args0": [
        {
          "type": "field_input",
          "name": "variableName",
          "text": "miVariable"
        },
        {
          "type": "input_value",
          "name": "value"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "variable_block",
      "tooltip": "Declara una variable y asigna un valor",
      "helpUrl": "",
      "extensions": ["validate_variable_declaration"]
    },

    // Declaración de variable sin asignación
    {
      "type": "variable_declaration_empty",
      "message0": "variable %1",
      "args0": [
        {
          "type": "field_input",
          "name": "variableName",
          "text": "miVariable"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "variable_block",
      "tooltip": "Declara una variable sin asignar un valor",
      "helpUrl": ""
    },

    // Asignación de valor a variable
    {
      "type": "variable_assignment",
      "message0": "%1 = %2",
      "args0": [
        {
          "type": "field_input",
          "name": "variableName",
          "text": "miVariable"
        },
        {
          "type": "input_value",
          "name": "value"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "variable_block",
      "tooltip": "Asigna un valor a una variable existente",
      "helpUrl": ""
    },

    // Uso de variable
    {
      "type": "variable_usage",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "variableName",
          "text": "miVariable"
        }
      ],
      "output": null,
      "style": "variable_block",
      "tooltip": "Utiliza una variable",
      "helpUrl": ""
    }
];
