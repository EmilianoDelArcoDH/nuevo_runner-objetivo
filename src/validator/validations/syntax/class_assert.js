import { ClassNode } from "../../pyast/pyast.js";
import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";
import { MethodAssert } from "./method_assert.js";

/**
 * Error class to indicate that a specified class does not exist.
 */
export class ErrorClassNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorClassNotExists.
     * @param {string} name - The name of the class that does not exist.
     */
    constructor(name) {
        super("class", `Class ${name} does not exist in module.`);
    }
}

/**
 * Error class to indicate that a specified class does not have a constructor.
 */
export class ErrorClassConstructorNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorClassConstructorNotExists.
     * @param {string} name - The name of the class without a constructor.
     */
    constructor(name) {
        super("class", `Class ${name} does not have a constructor.`);
    }
}

/**
 * Error class to indicate that a specified class constructor does not have a specified argument.
 */
export class ErrorClassConstructorArgumentNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorClassConstructorArgumentNotExists.
     * @param {string} name - The name of the class with missing constructor argument.
     * @param {string} argName - The name of the missing argument.
     */
    constructor(name, argName) {
        super("class", `Class ${name} constructor does not have argument ${argName}.`);
    }
}

/**
 * Error class to indicate that a specified argument of the class constructor
 * has a type mismatch with the expected type.
 */
export class ErrorClassConstructorArgumentType extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorClassConstructorArgumentType.
     * @param {string} name - The name of the class with a constructor argument type mismatch.
     * @param {string} argName - The name of the argument with a type mismatch.
     * @param {string} expectedType - The expected type of the argument.
     * @param {string} actualType - The actual type of the argument.
     */
    constructor(name, argName, expectedType, actualType) {
        super("class", `Class ${name} constructor argument ${argName} has type ${actualType}, expected ${expectedType}.`);
    }
}

/**
 * Class to perform assertions on a specified class within a module.
 */
export class ClassAssert {
    /**
     * Creates an instance of ClassAssert.
     * @param {Object} module - The module containing the class.
     * @param {string} name - The name of the class to assert.
     */
    constructor(module, name) {
        this.module = module;
        this.name = name;
        this.errors = [];

        this.classNode = this.checkClassExists();
    }

    /**
     * Checks if the class exists in the module.
     * @returns {Object|null} The class node if it exists, otherwise null.
     */
    checkClassExists() {
        // Search through the module's body to find the class
        for (const node of this.module.body) {
            if (node instanceof ClassNode && node.name === this.name) {
                return node;
            }
        }

        // If the class does not exist, return an error
        this.errors.push(new ErrorClassNotExists(this.name));
        return null;
    }

    /**
     * Asserts that the class has a constructor.
     * @returns {ClassAssert} The instance of ClassAssert for method chaining.
     */
    withConstructor() {
        if (!this.classNode) return this;
        if (this.errors.length > 0) return this;

        // Check if the class has a constructor
        if (!this.classNode.constructor) {
            this.errors.push(new ErrorClassConstructorNotExists(this.name));
            return this;
        }

        return this;
    }

    /**
     * Asserts that the class constructor has the expected arguments.
     * @param {Array<Object>} expectedArgs - An array of expected arguments.
     * @returns {ClassAssert} The instance of ClassAssert for method chaining.
     */
    withArguments(expectedArgs) {
        if (!this.classNode) return this;
        if (this.errors.length > 0) return this;

        // Get the arguments from the class constructor
        const actualArgs = this.classNode.constructor.args;

        // Check each expected argument
        for (let index = 0; index < expectedArgs.length; index++) {
            const expectedArg = expectedArgs[index];
            const actualArg = actualArgs[index];

            // Check if the argument name matches the expected name, if provided
            if (expectedArg.name && actualArg.name !== expectedArg.name) {
                this.errors.push(new ErrorClassConstructorArgumentNotExists(this.name, expectedArg.name));
                return this;
            }

            // Check if the argument type matches the expected type, if provided
            if (expectedArg.type && actualArg.type !== expectedArg.type) {
                this.errors.push(new ErrorClassConstructorArgumentType(this.name, actualArg.name, expectedArg.type, actualArg.type));
                return this;
            }
        }

        return this;
    }

    /**
     * Asserts that the class has a specified method and optionally checks its properties.
     * @param {string} name - The name of the method to assert.
     * @param {Function} [assertFunc] - An optional assertion function for the method.
     * @returns {ClassAssert} The instance of ClassAssert for method chaining.
     */
    withMethod(name, assertFunc) {
        if (!this.classNode) return this;
        if (this.errors.length > 0) return this;

        // Check if the class has the specified method
        const methodAssert = new MethodAssert(this.classNode, name);
        const errors = methodAssert.test();
        if (errors.length > 0) {
            this.errors.push(...errors);
            return this;
        }

        // Execute the assertion function for the method, if provided
        if (!assertFunc) return this;
        const methodErrors = assertFunc(new MethodAssert(this.classNode, name)).test();
        this.errors.push(...methodErrors);

        return this;
    }

    /**
     * Catch any errors that occur during the assertions and return a translated error message.
     * @param {Object} messages - An object containing translations for the error messages.
     * @returns {ClassAssert} The current instance for chaining.
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
