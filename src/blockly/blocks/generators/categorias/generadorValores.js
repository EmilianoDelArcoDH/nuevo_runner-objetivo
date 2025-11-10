import { Order, generateCode } from '../pythonGenerator';

// Generadores para los bloques de valores
export const blocksValues = {
    // Generador para el bloque de texto
    text: function (block) {
        try {
            var text = block.getFieldValue('TEXT');
            return [`'${text}'`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en text:', error);
            return ['# Error en el bloque de texto', Order.STATEMENT];
        }
    },

    // Generador para el bloque de número
    number: function (block) {
        try {
            var number = block.getFieldValue('NUM');
            return [`${number}`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en number:', error);
            return ['# Error en el bloque de número', Order.STATEMENT];
        }
    },

    // Generador para el bloque booleano
    boolean: function (block) {
        try {
            var bool = block.getFieldValue('BOOL') === 'TRUE';
            return [bool.toString(), Order.STATEMENT]; // Solo devuelve un valor
        } catch (error) {
            console.error('Error en boolean:', error);
            return ['# Error en el bloque booleano', Order.STATEMENT];
        }
    }
};
