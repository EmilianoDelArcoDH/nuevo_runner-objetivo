import * as Blockly from 'blockly';

// Bloques de inputs
export const inputsBlocks = [
    {
        "type": "input",
        "message0": "input %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "output": null, // Conector a la izquierda para devolver un valor
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Pide un valor por consola",
        "helpUrl": ""
    }
];
