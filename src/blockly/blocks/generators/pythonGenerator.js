import * as Blockly from 'blockly/core';
import { blocksVariables } from './categorias/generadorVariables';
import { blocksDecision } from './categorias/generadorDecisiones';
import { blocksIteration } from './categorias/generadorIteraciones';
import { blocksValues } from './categorias/generadorValores';
import { blocksOutputs } from './categorias/generadorOutputs';
import { blocksInputs } from './categorias/generadorInputs';
import { blocksCalculation } from './categorias/generadorCalculation';
import { blocksConversiones } from './categorias/generadorConversiones';
import { blocksFunctions } from './categorias/generadorFunctions';

// Crear una nueva instancia del generador de Python
export const pythonGen = new Blockly.Generator('PYTHON');

// Definir el orden para las operaciones en Python
export const Order = {
    ATOMIC: 0,
    FUNCTION_CALL: 1,
    STATEMENT: 2,    // Asegúrate de definir todos los órdenes necesarios
    RELATIONAL: 3,
    LOGICAL_NOT: 4,
    LOGICAL_AND: 5
};

// Función auxiliar para generar código
export function generateCode(block, field) {
    try {
        var targetBlock = block.getInputTargetBlock(field);
        var result = pythonGen.blockToCode(targetBlock);
        return result[0];
    } catch (error) {
        console.error(`Error generando código para el campo ${field}:`, error);
        return '';
    }
}



// Método scrub (ajustado)
pythonGen.scrub_ = function (block, code, thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
        // Evitar la concatenación de bloques que ya se han procesado
        const nextCode = pythonGen.blockToCode(nextBlock);
        if (nextCode && nextCode[0]) {
            return code + '\n' + nextCode[0]; // Asegúrate de añadir el código del siguiente bloque de manera correcta
        }
    }
    return code;
};

  

// Método workspaceToCode simplificado para solo devolver el código
pythonGen.workspaceToCode = function (workspace) {
    let code = '';
    workspace.getTopBlocks(true).forEach(block => {
        if (pythonGen.forBlock[block.type]) {
            const output = pythonGen.forBlock[block.type](block);
            if (output && output.length > 0) {
                code += output[0] + '\n';
            } else {
                code += 'error\n'; // Añadir 'error' si la salida es inválida
            }
        } else {
            code += 'error\n'; // Añadir 'error' si no se encuentra un generador
        }
    });
    return {
        code: code.trim(),
    };
};

  


// Registra los generadores de bloques para los bloques de declaración y uso de variables
pythonGen.forBlock['variable_declaration'] = blocksVariables.variable_declaration;
pythonGen.forBlock['variable_declaration_empty'] = blocksVariables.variable_declaration_empty;
pythonGen.forBlock['variable_assignment'] = blocksVariables.variable_assignment;
pythonGen.forBlock['variable_usage'] = blocksVariables.variable_usage;

// Registra los generadores de bloques para los bloques de decisión
pythonGen.forBlock['controls_if'] = blocksDecision.controls_if;
pythonGen.forBlock['controls_if_else'] = blocksDecision.controls_if_else;
pythonGen.forBlock['logic_negate'] = blocksDecision.logic_negate;
pythonGen.forBlock['logic_compare'] = blocksDecision.logic_compare;
pythonGen.forBlock['logic_operation'] = blocksDecision.logic_operation;

// Registra los generadores de bloques en pythonGen
pythonGen.forBlock['for_each_item_in_list'] = blocksIteration.for_each_item_in_list;
pythonGen.forBlock['while_loop'] = blocksIteration.while_loop;
pythonGen.forBlock['break'] = blocksIteration.break;

// Registra los generadores de bloques en pythonGen
pythonGen.forBlock['text'] = blocksValues.text;
pythonGen.forBlock['number'] = blocksValues.number;
pythonGen.forBlock['boolean'] = blocksValues.boolean;

// Registro de los generadores en pythonGen
pythonGen.forBlock['print'] = blocksOutputs.print;
pythonGen.forBlock['plot_line'] = blocksOutputs.plot_line;
pythonGen.forBlock['plot_scatter'] = blocksOutputs.plot_scatter;
pythonGen.forBlock['plot_histogram'] = blocksOutputs.plot_histogram;
pythonGen.forBlock['plot_bar_chart'] = blocksOutputs.plot_bar_chart;
pythonGen.forBlock['plot_boxplot'] = blocksOutputs.plot_boxplot;
pythonGen.forBlock['show_plot_canvas'] = blocksOutputs.show_plot_canvas;
pythonGen.forBlock['make_plot_title'] = blocksOutputs.make_plot_title;
pythonGen.forBlock['make_plot_xaxis_label'] = blocksOutputs.make_plot_xaxis_label;
pythonGen.forBlock['make_plot_yaxis_label'] = blocksOutputs.make_plot_yaxis_label;
pythonGen.forBlock['plot_horizontal_line'] = blocksOutputs.plot_horizontal_line;
pythonGen.forBlock['plot_vertical_line'] = blocksOutputs.plot_vertical_line;

// Registro de los inputs 
pythonGen.forBlock['input'] = blocksInputs.input;

// Registro de Calculation
pythonGen.forBlock['math_operation'] = blocksCalculation.math_operation;
pythonGen.forBlock['math_round'] = blocksCalculation.math_round;

// Registro de conversiones
pythonGen.forBlock['convert_to_float'] = blocksConversiones.convert_to_float;
pythonGen.forBlock['convert_to_int'] = blocksConversiones.convert_to_int;
pythonGen.forBlock['convert_to_str'] = blocksConversiones.convert_to_str;
pythonGen.forBlock['convert_to_bool'] = blocksConversiones.convert_to_bool;

// Registro de conversiones
pythonGen.forBlock['function_definition'] = blocksFunctions.function_definition;
pythonGen.forBlock['function_definition_with_params'] = blocksFunctions.function_definition_with_params;
pythonGen.forBlock['return'] = blocksFunctions.return;
