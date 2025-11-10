import { generateCode, Order } from '../pythonGenerator';

export const blocksCalculation = {

    // Generadores para bloques de cálculo
    math_operation: function(block) {
        const operation = block.getFieldValue('OP');
        const a = generateCode(block, 'A') || '0';
        const b = generateCode(block, 'B') || '0';
        
        let operator;
        switch (operation) {
            case 'ADD':
                operator = '+';
                break;
            case 'SUBTRACT':
                operator = '-';
                break;
            case 'MULTIPLY':
                operator = '*';
                break;
            case 'DIVIDE':
                operator = '/';
                break;
            case 'POWER':
                operator = '**';
                break;
            case 'MODULO':
                operator = '%';
                break;
            case 'FLOOR_DIVIDE':
                operator = '//';
                break;
            default:
                operator = '+';
        }

        return [`${a} ${operator} ${b}`, Order.ADDITIVE];
    },

    math_round: function(block) {
        const number = generateCode(block, 'NUMBER') || '0';
        return [`round(${number})`, Order.NONE];
    },

}