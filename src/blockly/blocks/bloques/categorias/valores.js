import * as Blockly from 'blockly';

// Bloques de valores
export const valoresBlocks = [
    // Bloque de texto
    {
        "type": "text",
        "message0": "texto %1",
        "args0": [
            {
                "type": "field_input",
                "name": "TEXT",
                "text": "hola mundo"
            }
        ],
        "output": "String",
        "style": "text_block",
        "tooltip": "Devuelve un texto",
        "helpUrl": ""
    },

    // Bloque de número
    {
        "type": "number",
        "message0": "número %1",
        "args0": [
            {
                "type": "field_number",
                "name": "NUM",
                "value": 0
            }
        ],
        "output": "Number",
        "style": "number_block",
        "tooltip": "Devuelve un número",
        "helpUrl": ""
    },

    // Bloque de valor booleano (true/false)
    {
        "type": "boolean",
        "message0": "%1",
        "args0": [
            {
                "type": "field_checkbox",
                "name": "BOOL",
                "checked": false
            }
        ],
        "output": "Boolean",
        "style": "boolean_block",
        "tooltip": "Devuelve un valor booleano",
        "helpUrl": ""
    }
];
