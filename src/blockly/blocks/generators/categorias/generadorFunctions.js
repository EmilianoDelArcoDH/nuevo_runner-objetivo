import { generateCode, Order } from '../pythonGenerator';

/**
 * Agrega un prefijo a cada línea del texto.
 * @param {string} text El texto al que se le agregará el prefijo.
 * @param {string} prefix El prefijo que se agregará a cada línea del texto.
 * @returns {string} El texto con el prefijo agregado a cada línea.
 */
function prefixLines(text, prefix) {
    if (!text) {
        return '';  // Retorna una cadena vacía si text es undefined o null
    }
    return text.split('\n').map(line => prefix + line).join('\n');
}

/**
 * Generadores para bloques de funciones
 */
export const blocksFunctions = {

    function_definition: function(block) {
        const functionName = block.getFieldValue('FUNCTION_NAME');
        const body = generateCode(block, 'BODY') || '';  // Asegúrate de que body no sea undefined
        return [`def ${functionName}():\n${prefixLines(body, '    ')}`, Order.NONE];
    },

    function_definition_with_params: function(block) {
        const functionName = block.getFieldValue('FUNCTION_NAME');
        const params = generateCode(block, 'PARAMS') || '';
        const body = generateCode(block, 'BODY') || '';  // Asegúrate de que body no sea undefined
        const returnValue = generateCode(block, 'RETURN') || 'None';
        return [`def ${functionName}(${params}):\n${prefixLines(body, '    ')}\n    return ${returnValue}`, Order.NONE];
    },

    return: function(block) {
        const returnValue = generateCode(block, 'RETURN_VALUE') || 'None';
        return [`return ${returnValue}`, Order.NONE];
    }
};
