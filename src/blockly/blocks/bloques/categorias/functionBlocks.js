import * as Blockly from 'blockly';

// Bloques de funciones
export const functionsBlocks = [
    // Bloque para definir una función sin parámetros y sin retorno
    {
        "type": "function_definition",
        "message0": "definir función %1",
        "args0": [
            {
                "type": "field_input",
                "name": "FUNCTION_NAME",
                "text": "miFuncion"
            }
        ],
        "message1": "hacer %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "BODY"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "function_block",
        "tooltip": "Define una función sin parámetros y sin retorno",
        "helpUrl": ""
    },

    // Bloque para definir una función con parámetros y retorno elegible
    {
        "type": "function_definition_with_params",
        "message0": "definir función %1 con parámetros %2",
        "args0": [
            {
                "type": "field_input",
                "name": "FUNCTION_NAME",
                "text": "miFuncion"
            },
            {
                "type": "input_value",
                "name": "PARAMS"
            }
        ],
        "message1": "hacer %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "BODY"
            }
        ],
        "message2": "retornar %1",
        "args2": [
            {
                "type": "input_value",
                "name": "RETURN"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "function_block",
        "tooltip": "Define una función con parámetros y un valor de retorno",
        "helpUrl": ""
    },

    // Bloque para retornar un valor
    {
        "type": "return",
        "message0": "retornar %1",
        "args0": [
            {
                "type": "input_value",
                "name": "RETURN_VALUE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "function_block",
        "tooltip": "Retorna un valor desde una función",
        "helpUrl": ""
    }
];
