import * as Blockly from 'blockly/core';
import { debounce } from 'lodash';

// Validación para la declaración de variable
function validateVariableDeclarationBlock(event) {
    const block = this;
    const variableName = block.getFieldValue('variableName');
    let warningText = '';

    if (!variableName || !variableName.trim()) {
        warningText = 'El nombre de la variable no puede estar vacío.';
    } else if (!/^[a-zA-Z_]\w*$/.test(variableName)) {
        warningText = 'El nombre de la variable debe comenzar con una letra o guion bajo, y no contener espacios.';
    }

    block.setWarningText(warningText || null);
}

// Validación para la declaración de función sin parámetros
function validateFunctionDeclarationNoParamsBlock(event) {
    const block = this;
    const functionName = block.getFieldValue('functionName');
    let warningText = '';

    if (!functionName || !functionName.trim()) {
        warningText = 'El nombre de la función no puede estar vacío.';
    } else if (!/^[a-zA-Z_]\w*$/.test(functionName)) {
        warningText = 'El nombre de la función debe comenzar con una letra o guion bajo, y no contener espacios.';
    }

    block.setWarningText(warningText || null);
}

// Validación para la declaración de función con parámetros
function validateFunctionDeclarationWithParamsBlock(event) {
    const block = this;
    const functionName = block.getFieldValue('functionName');
    const parameters = block.getFieldValue('parameters');
    let warningText = '';

    if (!functionName || !functionName.trim()) {
        warningText = 'El nombre de la función no puede estar vacío.';
    } else if (!/^[a-zA-Z_]\w*$/.test(functionName)) {
        warningText = 'El nombre de la función debe comenzar con una letra o guion bajo, y no contener espacios.';
    }

    if (parameters) {
        const paramsArray = parameters.split(',').map(param => param.trim());
        paramsArray.forEach(param => {
            if (!/^[a-zA-Z_]\w*$/.test(param)) {
                warningText = 'Todos los parámetros deben tener nombres válidos (sin espacios y comenzando con letra o guion bajo).';
            }
        });
    }

    block.setWarningText(warningText || null);
}

// Validación para la llamada de función sin parámetros
function validateFunctionCallNoParamsBlock(event) {
    const block = this;
    const functionName = block.getFieldValue('functionName');
    let warningText = '';

    if (!functionName || !functionName.trim()) {
        warningText = 'El nombre de la función no puede estar vacío.';
    } else if (!/^[a-zA-Z_]\w*$/.test(functionName)) {
        warningText = 'El nombre de la función debe ser válido (sin espacios y comenzando con letra o guion bajo).';
    }

    block.setWarningText(warningText || null);
}

// Validación para la llamada de función con parámetros
function validateFunctionCallWithParamsBlock(event) {
    const block = this;
    const functionName = block.getFieldValue('functionName');
    const argumentsBlock = block.getInputTargetBlock('arguments');
    let warningText = '';

    if (!functionName || !functionName.trim()) {
        warningText = 'El nombre de la función no puede estar vacío.';
    } else if (!/^[a-zA-Z_]\w*$/.test(functionName)) {
        warningText = 'El nombre de la función debe ser válido (sin espacios y comenzando con letra o guion bajo).';
    }

    if (argumentsBlock && argumentsBlock.outputConnection && argumentsBlock.outputConnection.check[0] !== 'Array') {
        warningText = 'Los argumentos deben estar en el formato correcto.';
    }

    block.setWarningText(warningText || null);
}

// Registrar las funciones de validación como extensiones en Blockly
Blockly.Extensions.register('validate_variable_declaration', function() {
    this.setOnChange(debounce(validateVariableDeclarationBlock.bind(this), 500));
});
Blockly.Extensions.register('validate_function_declaration', function() {
    this.setOnChange(debounce(validateFunctionDeclarationNoParamsBlock.bind(this), 500));
});
Blockly.Extensions.register('validate_function_declaration_with_params', function() {
    this.setOnChange(debounce(validateFunctionDeclarationWithParamsBlock.bind(this), 500));
});
Blockly.Extensions.register('validate_function_call', function() {
    this.setOnChange(debounce(validateFunctionCallNoParamsBlock.bind(this), 500));
});
Blockly.Extensions.register('validate_function_call_with_params', function() {
    this.setOnChange(debounce(validateFunctionCallWithParamsBlock.bind(this), 500));
});
