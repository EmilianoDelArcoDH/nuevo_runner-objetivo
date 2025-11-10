import { Order, generateCode } from '../pythonGenerator';

export const blocksIteration = {

    // Generador para el bloque "for each item in list"
    for_each_item_in_list: function (block) {
        try {
            var list = generateCode(block, 'list');
            var statements = generateCode(block, 'DO', Order.STATEMENT);
            return [`for item in ${list}:\n${statements}`, `${statements}`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en for_each_item_in_list:', error);
            return ['# Error en el bucle for each item in list', Order.STATEMENT];
        }
    },

    // Generador para el bloque "while"
    while_loop: function (block) {
        try {
            var condition = generateCode(block, 'condition');
            var statements = generateCode(block, 'DO', Order.STATEMENT);
            return [`while ${condition}:\n${statements}`, `${statements}`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en while_loop:', error);
            return ['# Error en el bucle while', Order.STATEMENT];
        }
    },

    // Generador para el bloque "break"
    break: function (block) {
        try {
            return ['break', 'break', Order.STATEMENT];
        } catch (error) {
            console.error('Error en break:', error);
            return ['# Error en el break', Order.STATEMENT];
        }
    }
};
