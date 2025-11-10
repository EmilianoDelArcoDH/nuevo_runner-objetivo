import { Order, generateCode } from '../pythonGenerator';

export const blocksConversiones = {

    // Generadores para bloques de conversión
    convert_to_float: function(block) {
        const value = generateCode(block, 'VALUE') || '0';
        return [`float(${value})`, Order.NONE];
    },

    convert_to_int: function(block) {
        const value = generateCode(block, 'VALUE') || '0';
        return [`int(${value})`, Order.NONE];
    },

    convert_to_str: function(block) {
        const value = generateCode(block, 'VALUE') || '""';
        return [`str(${value})`, Order.NONE];
    },

    convert_to_bool: function(block) {
        const value = generateCode(block, 'VALUE') || 'False';
        return [`bool(${value})`, Order.NONE];
    }

}
