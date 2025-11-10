import { Order, generateCode } from '../pythonGenerator';

export const blocksInputs = {
    // Generador para input
    input: function (block) {
        try {
            var value = generateCode(block, 'VALUE') || '""';
            return [`input(${value})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en input:', error);
            return ['# Error en input\n', Order.STATEMENT];
        }
    },
}