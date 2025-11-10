import { FunctionNode } from "../../pyast/pyast.js";
import { LowLevelAssert } from "./assert.js";
import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Class representing an error for a non-existing function.
 * @extends CodeSyntaxValidatorError
 */
export class ErrorFunctionNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorFunctionNotExists.
     * @param {string} name - The name of the function that does not exist.
     */
    constructor(name) {
        super("function", `Function ${name} does not exist in module.`);
    }
}

/**
 * Class representing an error for a missing function argument.
 * @extends CodeSyntaxValidatorError
 */
export class ErrorFunctionArgumentNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorFunctionArgumentNotExists.
     * @param {string} name - The name of the function.
     * @param {string} argName - The name of the argument that does not exist.
     */
    constructor(name, argName) {
        super("function", `Function ${name} does not have argument ${argName}.`);
    }
}

/**
 * Class representing an error for incorrect function argument type.
 * @extends CodeSyntaxValidatorError
 */
export class ErrorFunctionArgumentType extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorFunctionArgumentType.
     * @param {string} name - The name of the function.
     * @param {string} argName - The name of the argument with a type mismatch.
     * @param {string} expectedType - The expected type of the argument.
     * @param {string} actualType - The actual type of the argument.
     */
    constructor(name, argName, expectedType, actualType) {
        super("function", `Function ${name} argument ${argName} has type ${actualType}, expected ${expectedType}.`);
    }
}

/**
 * Class representing an error for incorrect function return type.
 * @extends CodeSyntaxValidatorError
 */
export class ErrorFunctionReturnType extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorFunctionReturnType.
     * @param {string} name - The name of the function.
     * @param {string} expectedType - The expected return type of the function.
     * @param {string} actualType - The actual return type of the function.
     */
    constructor(name, expectedType, actualType) {
        super("function", `Function ${name} has return type ${actualType}, expected ${expectedType}.`);
    }
}

/**
 * Class to assert properties of a function within a module.
 */
export class FunctionAssert {
    /**
     * Creates an instance of FunctionAssert.
     * @param {Object} module - The module containing functions to be validated.
     * @param {string} name - The name of the function to be asserted.
     */
    constructor(module, name) {
        this.module = module;
        this.name = name;
        this.errors = [];

        this.functionNode = this.checkFunctionExists();
    }

    /**
     * Checks if the function exists in the module.
     * @returns {FunctionNode|null} The function node if it exists, otherwise null.
     */
    checkFunctionExists() {
        // Search through the module's body to find the function
        for (const node of this.module.body) {
            if (node instanceof FunctionNode && node.name === this.name) {
                return node;
            }
        }

        // If the function does not exist, return an error
        this.errors.push(new ErrorFunctionNotExists(this.name));
        return null;
    }

    /**
     * Asserts that the function has the expected arguments.
     * @param {Array} expectedArgs - An array of expected argument objects.
     * @returns {FunctionAssert} The current instance for chaining.
     */
    withArguments(expectedArgs) {
        if (!this.functionNode) return this;
        if (this.errors.length > 0) return this;

        // Check if the function arguments match the expected arguments
        for (let index = 0; index < expectedArgs.length; index++) {
            const expectedArg = expectedArgs[index];
            // Get the argument from the function node
            const arg = this.functionNode.args[index];

            // Check if the argument name matches the expected name, if provided
            if (expectedArg.name && arg.name !== expectedArg.name) {
                this.errors.push(new ErrorFunctionArgumentNotExists(this.name, expectedArg.name));
                return this;
            }
            
            // Check if the argument type matches the expected type, if provided
            if (expectedArg.type && arg.type !== expectedArg.type) {
                this.errors.push(new ErrorFunctionArgumentType(this.name, arg.name, expectedArg.type, arg.type));
                return this;
            }
        }

        return this;
    }

    /**
     * Asserts that the function returns a value of the expected type.
     * @param {string} expectedType - The expected return type of the function.
     * @returns {FunctionAssert} The current instance for chaining.
     */
    thatReturnsThisType(expectedType) {
        if (!this.functionNode) return this;
        if (this.errors.length > 0) return this;

        const actualType = this.functionNode.returnType;

        // Check if the function return type matches the expected type
        if (actualType !== expectedType) {
            this.errors.push(new ErrorFunctionReturnType(this.name, expectedType, actualType));
            //console.log("Error en el tipo de retorno");
            //console.log(this.errors);
        }

        return this;
    }

    /**
     * Executes an assertion function for the body of the function.
     * @param {function} assertFunc - The assertion function to be executed.
     * @returns {FunctionAssert} The current instance for chaining.
     */
    withBody(assertFunc) {
        if (!this.functionNode) return this;
        if (this.errors.length > 0) return this;

        // Execute the assertion function for the function body
        if (!assertFunc) return this;
        const assertionsToExecute = assertFunc(new LowLevelAssert(this.functionNode));

        // Check the errors from the assertions
        // It can be an array of assertions or a single assertion
        if (assertionsToExecute.test) {
            const errors = assertionsToExecute.test();
            this.errors.push(...errors);
        } else {
            assertionsToExecute.forEach(assertion => {
                const errors = assertion.test();
                this.errors.push(...errors);
            });
        }

        return this;
    }

    // /**
    //  * Catch any errors that occur during the assertions and return a translated error message.
    //  * @param {Object} messages - An object containing translations for the error messages.
    //  * @returns {FunctionAssert} The current instance for chaining.
    //  */
    // catch(messages) {
    //     if (this.errors.length == 0) return this;

    //     // Check if the last error already has translated messages
    //     if (this.errors[this.errors.length - 1].translatedMessages) return this;

    //     // Obtain the last error from the list and replace it with the 
    //     // object containing the translations
    //     this.errors[this.errors.length - 1].translatedMessages = messages;
    //     return this;
    // }
    /**
 * Catch any errors that occur during the assertions and return a translated error message.
 * @param {Object} messages - An object containing translations for the error messages.
 * @returns {VariableAssert} The current instance for chaining.
 */
    catch(messages) {
        if (this.errors.length === 0) return this; // No errors to process
        // Update the last error with the translated messages
        this.errors[this.errors.length - 1].translatedMessages = messages;
        return this;
    }

    /**
     * Returns the accumulated errors from the assertions.
     * @returns {Array} An array of error instances encountered during the assertions.
     */
    test() {
        return this.errors;
    }
}
