import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Error class indicating that a return statement does not exist in the node.
 */
export class ErrorReturnNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorReturnNotExists.
     */
    constructor() {
        super("return", `Return statement does not exist in node.`);
    }
}

/**
 * Error class indicating that the return statement has an incorrect value.
 */
export class ErrorReturnValue extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorReturnValue.
     * @param {string} expectedValue - The expected return value.
     * @param {string} actualValue - The actual return value.
     */
    constructor(expectedValue, actualValue) {
        super("return", `Return statement has value ${actualValue}, expected ${expectedValue}.`);
    }
}

/**
 * Class to perform assertions on the return statement within a node.
 */
export class ReturnAssert {
    /**
     * Creates an instance of ReturnAssert.
     * @param {Object} node - The node containing the return statement.
     */
    constructor(node) {
        this.node = node;
        this.errors = [];

        this.returnNode = this.checkReturnExists();
    }

    /**
     * Checks if the return statement exists in the node.
     * @returns {Object|null} The return node if it exists, otherwise null.
     */
    checkReturnExists() {
        // Search through the node's body to find the return statement
        for (const childNode of this.node.body) {
            if (childNode.type === 'ReturnNode') {
                return childNode;
            }
        }

        // If the return statement does not exist, return an error
        this.errors.push(new ErrorReturnNotExists());
        return null;
    }

    /**
     * Deconstructs a call node to its string representation.
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
     * Asserts that the return statement has the expected value.
     * @param {string} expectedValue - The expected value of the return statement.
     * @returns {ReturnAssert} The instance of ReturnAssert for method chaining.
     */
    withValue(expectedValue) {
        if (!this.returnNode) return this;
        if (this.errors.length > 0) return this;

        // Determine the actual return value based on the node type
        let actualValue;
        switch (this.returnNode.value.type) {
            case 'AttributeNode':
                actualValue = `${this.returnNode.value.value.id}.${this.returnNode.value.attr}`;
                break;
            case 'ConstantNode':
                actualValue = this.returnNode.value.value;
                break;
            case 'CallNode':
                actualValue = this.deconstructCallNode(this.returnNode.value);
                break;
            case 'NameNode':
                actualValue = this.returnNode.value.id;
                break;
            case 'UnaryOpNode':
                actualValue = `${this.returnNode.value.op} ${this.returnNode.value.operand.id}`;
                break;
            case 'BinOpNode':
                actualValue = `${this.returnNode.value.left.id} ${this.returnNode.value.operator} ${this.returnNode.value.right.left.id} ${this.returnNode.value.right.operator} ${this.returnNode.value.right.right.value}`;
                break;
            default:
                actualValue = this.returnNode.value.id;
        }

        // Check if the return value matches the expected value
        if (actualValue !== expectedValue) {
            this.errors.push(new ErrorReturnValue(expectedValue, actualValue));
            return this;
        }

        return this;
    }

    /**
     * Catch any errors that occur during the assertions and return a translated error message.
     * @param {Object} messages - An object containing translations for the error messages.
     * @returns {ReturnAssert} The current instance for chaining.
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
