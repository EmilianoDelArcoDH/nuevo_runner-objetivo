import { LowLevelAssert } from "./assert.js";
import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Error class indicating that a for statement does not exist in the node.
 */
export class ErrorForStatementNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorForStatementNotExists.
     */
    constructor() {
        super("for statement", `For statement does not exist in node.`);
    }
}

/**
 * Class to perform assertions on for statements within a node.
 */
export class ForAssert {
    /**
     * Creates an instance of ForAssert.
     * @param {Object} node - The node containing the for statement.
     * @param {string} condition - The expected condition of the for statement.
     */
    constructor(node, condition) {
        this.node = node;
        this.errors = [];
        this.condition = condition;

        this.forNode = this.checkForStatementExists();
    }

    /**
     * Deconstructs a for node into its string representation.
     * @param {Object} node - The for node to deconstruct.
     * @returns {string} The deconstructed for node as a string.
     */
    deconstructForNode(node) {
        return `${node.target} in ${node.iter.func.id}(${node.iter.args.map(arg => {
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
     * Checks if the for statement exists in the node and matches the expected condition.
     * @returns {Object|null} The for statement node if it exists and matches the condition, otherwise null.
     */
    checkForStatementExists() {
        let foundChildNode;

        // Search through the node's body to find the for statement
        for (const childNode of this.node.body) {
            if (!childNode) continue;
            if (childNode.type === 'ForNode') {
                foundChildNode = childNode;
                break;
            }
        }
        if (!foundChildNode) {
            this.errors.push(new ErrorForStatementNotExists());
            return null;
        }

        // Check if the for statement condition matches the expected condition
        const actualCondition = this.deconstructForNode(foundChildNode);
        if (actualCondition !== this.condition) {
            this.errors.push(new ErrorForStatementNotExists());
            return null;
        }

        return foundChildNode;
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
     * Asserts that the for statement has the expected body.
     * @param {function} assertFunc - The assertion function to apply to the for statement body.
     * @returns {ForAssert} The instance of ForAssert for method chaining.
     */
    withBody(assertFunc) {
        if (!this.forNode) return this;
        if (this.errors.length > 0) return this;

        // Execute the assertion function for the for statement body
        if (!assertFunc) return this;
        const assertionsToExecute = assertFunc(new LowLevelAssert(this.forNode));

        // Check the errors from the assertions
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
     * @returns {ForAssert} The current instance for chaining.
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
