import * as Blockly from 'blockly';

// Bloques de conversión
export const conversionBlocks = [
    // Bloque para convertir a float
    {
        "type": "convert_to_float",
        "message0": "convertir a float %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "output": "Number",
        "style": "conversion_block",
        "tooltip": "Convierte un valor a tipo float",
        "helpUrl": ""
    },

    // Bloque para convertir a int
    {
        "type": "convert_to_int",
        "message0": "convertir a int %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "output": "Number",
        "style": "conversion_block",
        "tooltip": "Convierte un valor a tipo int",
        "helpUrl": ""
    },

    // Bloque para convertir a str
    {
        "type": "convert_to_str",
        "message0": "convertir a str %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "output": "String",
        "style": "conversion_block",
        "tooltip": "Convierte un valor a tipo string",
        "helpUrl": ""
    },

    // Bloque para convertir a bool
    {
        "type": "convert_to_bool",
        "message0": "convertir a bool %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "output": "Boolean",
        "style": "conversion_block",
        "tooltip": "Convierte un valor a tipo booleano",
        "helpUrl": ""
    }
];
