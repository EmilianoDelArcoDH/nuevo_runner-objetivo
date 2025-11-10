import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Error class indicating that a function call does not exist in the node.
 */
export class ErrorFunctionCallNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorFunctionCallNotExists.
     * @param {string} name - The name of the function call.
     */
    constructor(name) {
        super("function call", `Function call ${name} does not exist in node.`);
    }
}

/**
 * Error class indicating that a function call has incorrect arguments.
 */
export class ErrorFunctionCallArguments extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorFunctionCallArguments.
     * @param {string} name - The name of the function call.
     * @param {Array} expectedArgs - The expected arguments for the function call.
     * @param {Array} actualArgs - The actual arguments of the function call.
     */
    constructor(name, expectedArgs, actualArgs) {
        super("function call", `Function call ${name} has arguments ${actualArgs}, expected ${expectedArgs}.`);
    }
}

/**
 * Class to perform assertions on function calls within a node.
 */
export class FunctionCallAssert {
    /**
     * Creates an instance of FunctionCallAssert.
     * @param {Object} node - The node containing the function call.
     * @param {string} name - The name of the function to assert.
     */
    constructor(node, name) {
        this.node = node;
        this.name = name;
        this.errors = [];

        this.functionCallNode = this.checkFunctionCallExists();
    }

    /**
     * Checks if the function call exists in the node.
     * @returns {Object|null} The function call node if it exists, otherwise null.
     */
    checkFunctionCallExists() {
        // Search through the node's body to find the function call
        if (this.node.body) {
            for (const childNode of this.node.body) {
                if (childNode.type === 'ExprNode' && childNode.value.type === 'CallNode' && childNode.value.func.id === this.name) {
                    return childNode.value;
                }
            }
        } else {
            // In case node is not structured with a 'body'
            for (const childNode of this.node) {
                if (childNode.type === 'ExprNode' && childNode.value.type === 'CallNode' && childNode.value.func.id === this.name) {
                    return childNode.value;
                }
            }
        }

        // If the function call does not exist, return an error
        this.errors.push(new ErrorFunctionCallNotExists(this.name));
        return null;
    }

    /**
     * Deconstructs a call node into its string representation.
     * @param {Object} node - The call node to deconstruct.
     * @returns {string} The deconstructed call node as a string.
     */
    deconstructCallNode(node) {
        return `${node.func.id}(${node.args.map(arg => {
            switch (arg.type) {
                case 'AttributeNode':
                    return `${arg.value.id}.${arg.attr}`;
                case 'ConstantNode':
                    return arg.value;
                case 'CallNode':
                    return this.deconstructCallNode(arg);
                default:
                    return arg.id;
            }
        }).join(', ')})`;
    }

    /**
     * Asserts that the function call has the expected arguments.
     * @param {Array} expectedArgs - The expected arguments for the function call.
     * @returns {FunctionCallAssert} The instance of FunctionCallAssert for method chaining.
     */
    withArguments(expectedArgs) {
        if (!this.functionCallNode) return this;
        if (this.errors.length > 0) return this;

        // Get the actual arguments from the function call node
        const actualArgs = this.functionCallNode.args.map(arg => {
            if (!arg) return null;
            switch (arg.type) {
                case 'AttributeNode':
                    return `${arg.value.id}.${arg.attr}`;
                case 'ConstantNode':
                    return arg.value;
                case 'CallNode':
                    return this.deconstructCallNode(arg);
                default:
                    return arg.id;
            }
        });

        // Check if the actual arguments match the expected arguments
        if (actualArgs.join(', ') !== expectedArgs.join(', ')) {
            this.errors.push(new ErrorFunctionCallArguments(this.name, expectedArgs, actualArgs));
        }

        return this;
    }

    /**
     * Catch any errors that occur during the assertions and return a translated error message.
     * @param {Object} messages - An object containing translations for the error messages.
     * @returns {FunctionCallAssert} The current instance for chaining.
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
