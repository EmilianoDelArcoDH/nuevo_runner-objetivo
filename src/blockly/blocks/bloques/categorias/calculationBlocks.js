import * as Blockly from 'blockly';

// Bloques de cálculo
export const calculationBlocks = [
    // Bloque para operaciones básicas
    {
        "type": "math_operation",
        "message0": "Operacion %1 %2 %3",
        "args0": [
            {
                "type": "input_value",
                "name": "A",
                "check": "Number"
            },
            {
                "type": "field_dropdown",
                "name": "OP",
                "options": [
                    ["suma (+)", "ADD"],
                    ["resta (-)", "SUBTRACT"],
                    ["multiplicación (*)", "MULTIPLY"],
                    ["división (/)", "DIVIDE"],
                    ["potencia (**)", "POWER"],
                    ["módulo (%)", "MODULO"],
                    ["división entera (//)", "FLOOR_DIVIDE"]
                ]
            },
            {
                "type": "input_value",
                "name": "B",
                "check": "Number"
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "style": "math_block",
        "tooltip": "Realiza una operación matemática básica entre dos números",
        "helpUrl": ""
    }
    ,
    

    // Bloque para redondear
    {
        "type": "math_round",
        "message0": "redondear %1",
        "args0": [
            {
                "type": "input_value",
                "name": "NUMBER"
            }
        ],
        "output": "Number",
        "style": "math_block",
        "tooltip": "Redondea un número al entero más cercano",
        "helpUrl": ""
    }
];
