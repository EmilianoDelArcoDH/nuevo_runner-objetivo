import { Order, generateCode } from '../pythonGenerator';

export const blocksDecision = {

    // Generador para el bloque "si" (if)
    controls_if: function (block) {
        try {
            var condition = generateCode(block, 'condition');
            var statements = generateCode(block, 'do');
            return [`if ${condition}:\n${statements}`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en controls_if:', error);
            return ['# Error en el bloque if', Order.STATEMENT];
        }
    },

    // Generador para el bloque "si/sino" (if-else)
    controls_if_else: function (block) {
        try {
            var condition = generateCode(block, 'condition');
            var statements_if = generateCode(block, 'do');
            var statements_else = generateCode(block, 'else');
            return [`if ${condition}:\n${statements_if}\nelse:\n${statements_else}`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en controls_if_else:', error);
            return ['# Error en el bloque if-else', Order.STATEMENT];
        }
    },

    // Generador para el bloque de negación (not)
    logic_negate: function (block) {
        try {
            var bool = generateCode(block, 'BOOL');
            return [`not ${bool}`, Order.LOGICAL_NOT];
        } catch (error) {
            console.error('Error en logic_negate:', error);
            return ['# Error en el bloque not', Order.LOGICAL_NOT];
        }
    },

    // Generador para el bloque de comparación (>, <, >=, <=, ==, !=)
    logic_compare: function (block) {
        try {
            var A = generateCode(block, 'A');
            var B = generateCode(block, 'B');
            var operator = block.getFieldValue('OP');
            const operatorsMap = {
                EQ: '==',
                NEQ: '!=',
                GT: '>',
                GTE: '>=',
                LT: '<',
                LTE: '<='
            };
            return [`${A} ${operatorsMap[operator]} ${B}`, Order.RELATIONAL];
        } catch (error) {
            console.error('Error en logic_compare:', error);
            return ['# Error en el bloque compare', Order.RELATIONAL];
        }
    },

    // Generador para el bloque "y/o" lógico
    logic_operation: function (block) {
        try {
            var A = generateCode(block, 'A');
            var B = generateCode(block, 'B');
            var operator = block.getFieldValue('OP');
            const operatorsMap = {
                AND: 'and',
                OR: 'or'
            };
            return [`${A} ${operatorsMap[operator]} ${B}`, Order.LOGICAL_AND];
        } catch (error) {
            console.error('Error en logic_operation:', error);
            return ['# Error en el bloque lógica', Order.LOGICAL_AND];
        }
    }
};
