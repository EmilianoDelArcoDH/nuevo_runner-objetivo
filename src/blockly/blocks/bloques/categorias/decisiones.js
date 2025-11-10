import * as Blockly from 'blockly';

export const decisionBlocks = [
    // Bloque "si" (if)
    {
      "type": "controls_if",
      "message0": "si %1 entonces",
      "args0": [
        {
          "type": "input_value",
          "name": "condition"
        }
      ],
      "message1": "hacer %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "do"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "logic_block",
      "tooltip": "Si la condición es verdadera, ejecuta las instrucciones",
      "helpUrl": ""
    },

    // Bloque "si/sino" (if-else)
    {
      "type": "controls_if_else",
      "message0": "si %1 entonces",
      "args0": [
        {
          "type": "input_value",
          "name": "condition"
        }
      ],
      "message1": "hacer %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "do"
        }
      ],
      "message2": "sino hacer %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "else"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "logic_block",
      "tooltip": "Si la condición es verdadera, ejecuta el bloque 'hacer', de lo contrario ejecuta el bloque 'sino'.",
      "helpUrl": ""
    },
    {
        "type": "logic_negate",
        "message0": "no %1",
        "args0": [
            {
            "type": "input_value",
            "name": "BOOL"
            }
        ],
        "output": "Boolean",
        "style": "logic_block",
        "tooltip": "Devuelve verdadero si la entrada es falsa.",
        "helpUrl": ""
    },

    {
        "type": "logic_compare",
        "message0": "%1 %2 %3",
        "args0": [
            {
            "type": "input_value",
            "name": "A"
            },
            {
            "type": "field_dropdown",
            "name": "OP",
            "options": [
                ["=", "EQ"],
                ["≠", "NEQ"],
                [">", "GT"],
                [">=", "GTE"],
                ["<", "LT"],
                ["<=", "LTE"]
            ]
            },
            {
            "type": "input_value",
            "name": "B"
            }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "style": "logic_block",
        "tooltip": "Compara dos valores.",
        "helpUrl": ""
      },
      {
        "type": "logic_operation",
        "message0": "%1 %2 %3",
        "args0": [
          {
            "type": "input_value",
            "name": "A",
            "check": "Boolean"
          },
          {
            "type": "field_dropdown",
            "name": "OP",
            "options": [
              ["y", "AND"],
              ["o", "OR"]
            ]
          },
          {
            "type": "input_value",
            "name": "B",
            "check": "Boolean"
          }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "style": "logic_block",
        "tooltip": "Devuelve verdadero si la operación seleccionada entre las dos entradas es verdadera.",
        "helpUrl": ""
      }
];
