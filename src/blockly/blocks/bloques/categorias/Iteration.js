import * as Blockly from 'blockly';

// Bloques de iteración y control de flujo
export const iterationBlocks = [
    // Iteración "for each item in list"
    {
      "type": "for_each_item_in_list",
      "message0": "para cada ítem en la lista %1",
      "args0": [
        {
          "type": "input_value",
          "name": "list",
          "check": "Array"
        }
      ],
      "message1": "hacer %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DO"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "loop_block",
      "tooltip": "Itera sobre cada ítem en una lista",
      "helpUrl": ""
    },

    // Iteración "while"
    {
      "type": "while_loop",
      "message0": "mientras %1",
      "args0": [
        {
          "type": "input_value",
          "name": "condition",
          "check": "Boolean"
        }
      ],
      "message1": "hacer %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DO"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "style": "loop_block",
      "tooltip": "Ejecuta un bloque mientras la condición sea verdadera",
      "helpUrl": ""
    },

    // Control "break"
    {
      "type": "break",
      "message0": "salir del bucle",
      "previousStatement": null,
      "nextStatement": null,
      "style": "control_block",
      "tooltip": "Rompe el bucle actual",
      "helpUrl": ""
    }
];
