import { FunctionNode } from "../../pyast/pyast.js";
import { LowLevelAssert } from "./assert.js";
import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Error class indicating that a specified method does not exist.
 */
export class ErrorMethodNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorMethodNotExists.
     * @param {string} name - The name of the method that does not exist.
     */
    constructor(name) {
        super("method", `Method ${name} does not exist in class.`);
    }
}

/**
 * Error class indicating that a specified method does not have a specified argument.
 */
export class ErrorMethodArgumentNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorMethodArgumentNotExists.
     * @param {string} name - The name of the method.
     * @param {string} argName - The name of the missing argument.
     */
    constructor(name, argName) {
        super("method", `Method ${name} does not have argument ${argName}.`);
    }
}

/**
 * Error class indicating that a method argument has an incorrect type.
 */
export class ErrorMethodArgumentType extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorMethodArgumentType.
     * @param {string} name - The name of the method.
     * @param {string} argName - The name of the argument with the wrong type.
     * @param {string} expectedType - The expected type of the argument.
     * @param {string} actualType - The actual type of the argument.
     */
    constructor(name, argName, expectedType, actualType) {
        super("method", `Method ${name} argument ${argName} has type ${actualType}, expected ${expectedType}.`);
    }
}

/**
 * Error class indicating that a method has an incorrect return type.
 */
export class ErrorMethodReturnType extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorMethodReturnType.
     * @param {string} name - The name of the method.
     * @param {string} expectedType - The expected return type.
     * @param {string} actualType - The actual return type.
     */
    constructor(name, expectedType, actualType) {
        super("method", `Method ${name} has return type ${actualType}, expected ${expectedType}.`);
    }
}

/**
 * Class to perform assertions on a specified method within a class.
 */
export class MethodAssert {
    /**
     * Creates an instance of MethodAssert.
     * @param {Object} classNode - The class node containing the method.
     * @param {string} name - The name of the method to assert.
     */
    constructor(classNode, name) {
        this.classNode = classNode;
        this.name = name;
        this.errors = [];

        this.methodNode = this.checkMethodExists();
    }

    /**
     * Checks if the method exists in the class.
     * @returns {Object|null} The method node if it exists, otherwise null.
     */
    checkMethodExists() {
        // Search through the class body to find the method
        for (const node of this.classNode.methods) {
            if (node instanceof FunctionNode && node.name === this.name) {
                return node;
            }
        }

        // If the method does not exist, return an error
        this.errors.push(new ErrorMethodNotExists(this.name));
        return null;
    }

    /**
     * Asserts that the method has the expected arguments.
     * @param {Array<Object>} expectedArgs - An array of expected arguments.
     * @returns {MethodAssert} The instance of MethodAssert for method chaining.
     */
    withArguments(expectedArgs) {
        if (!this.methodNode) return this;
        if (this.errors.length > 0) return this;

        // Check if the method arguments match the expected arguments
        for (let index = 0; index < expectedArgs.length; index++) {
            const expectedArg = expectedArgs[index];
            // Get the argument from the method node
            const arg = this.methodNode.args[index];

            // Check if the argument name matches the expected name, if provided
            if (expectedArg.name && arg.name !== expectedArg.name) {
                this.errors.push(new ErrorMethodArgumentNotExists(this.name, expectedArg.name));
                return this;
            }

            // Check if the argument type matches the expected type, if provided
            if (expectedArg.type && arg.type !== expectedArg.type) {
                this.errors.push(new ErrorMethodArgumentType(this.name, arg.name, expectedArg.type, arg.type));
                return this;
            }
        }

        return this;
    }

    /**
     * Asserts that the method returns the expected type.
     * @param {string} expectedType - The expected return type.
     * @returns {MethodAssert} The instance of MethodAssert for method chaining.
     */
    thatReturnsThisType(expectedType) {
        if (!this.methodNode) return this;
        if (this.errors.length > 0) return this;

        const actualType = this.methodNode.returnType;

        // Check if the method return type matches the expected type
        if (actualType !== expectedType) {
            this.errors.push(new ErrorMethodReturnType(this.name, expectedType, actualType));
        }

        return this;
    }

    /**
     * Asserts the method body using a custom assertion function.
     * @param {Function} assertFunc - A custom assertion function to check the method body.
     * @returns {MethodAssert} The instance of MethodAssert for method chaining.
     */
    withBody(assertFunc) {
        if (!this.methodNode) return this;
        if (this.errors.length > 0) return this;

        // Execute the assertion function for the method body
        if (!assertFunc) return this;
        const assertionsToExecute = assertFunc(new LowLevelAssert(this.methodNode));

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

    /**
     * Catch any errors that occur during the assertions and return a translated error message.
     * @param {Object} messages - An object containing translations for the error messages.
     * @returns {MethodAssert} The current instance for chaining.
     */
    catch(messages) {
        if (this.errors.length <= 1) return this;

        // Obtain the last error from the list and replace it with the 
        // object containing the translations
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
