import { Order, generateCode } from '../pythonGenerator';

export const blocksVariables = {
    // Generador para la declaración y asignación de variables
    variable_declaration: function (block) {
        try {
            const variableName = block.getFieldValue('variableName');
            const value = generateCode(block, 'value');
            return [`${variableName} = ${value}`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en variable_declaration:', error);
            return ['# Error en la declaración de variable', Order.STATEMENT];
        }
    },

    // Generador para la declaración de variables sin asignación
    variable_declaration_empty: function (block) {
        try {
            const variableName = block.getFieldValue('variableName');
            return [`${variableName}`, Order.ATOMIC];
        } catch (error) {
            console.error('Error en variable_declaration_empty:', error);
            return ['# Error en la declaración vacía de variable', Order.ATOMIC];
        }
    },

    // Generador para la asignación de valor a variables
    variable_assignment: function (block) {
        try {
            const variableName = block.getFieldValue('variableName');
            const value = generateCode(block, 'value');
            return [`${variableName} = ${value}`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en variable_assignment:', error);
            return ['# Error en la asignación de variable', Order.STATEMENT];
        }
    },

    // Generador para el uso de variables
    variable_usage: function (block) {
        try {
            const variableName = block.getFieldValue('variableName');
            return [`${variableName}`, Order.ATOMIC];
        } catch (error) {
            console.error('Error en variable_usage:', error);
            return ['# Error en el uso de variable', Order.ATOMIC];
        }
    }
};
