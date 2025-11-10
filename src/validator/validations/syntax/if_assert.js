import { LowLevelAssert } from "./assert.js";
import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Error class indicating that an if statement does not exist in the node.
 */
export class ErrorIfStatementNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorIfStatementNotExists.
     * @param {string} condition - The condition of the if statement.
     */
    constructor(condition) {
        super("if statement", `If statement with condition ${condition} does not exist in node.`);
    }
}

/**
 * Class to perform assertions on if statements within a node.
 */
export class IfAssert {
    /**
     * Creates an instance of IfAssert.
     * @param {Object} node - The node containing the if statement.
     * @param {string} condition - The expected condition of the if statement.
     */
    constructor(node, condition) {
        this.node = node;
        this.condition = condition;
        this.errors = [];

        this.ifNode = this.checkIfStatementExists();
    }

    /**
     * Checks if the if statement exists in the node and matches the expected condition.
     * @returns {Object|null} The if statement node if it exists and matches the condition, otherwise null.
     */
    checkIfStatementExists() {
        let foundChildNode;

        // Search through the node's body to find the if statement
        for (const childNode of this.node.body) {
            if (!childNode) continue;
            if (childNode.type === 'IfNode') {
                foundChildNode = childNode;
                break;
            }
        }
        if (!foundChildNode) {
            this.errors.push(new ErrorIfStatementNotExists(this.condition));
            return null;
        }

        // Check if the if statement condition matches the expected condition
        const actualCondition = foundChildNode.condition;
        if (actualCondition !== this.condition) {
            this.errors.push(new ErrorIfStatementNotExists(this.condition));
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
     * Asserts that the if statement has the expected body.
     * @param {function} assertFunc - The assertion function to apply to the if statement body.
     * @returns {IfAssert} The instance of IfAssert for method chaining.
     */
    withBody(assertFunc) {
        if (!this.ifNode) return this;
        if (this.errors.length > 0) return this;

        // Execute the assertion function for the if statement body
        if (!assertFunc) return this;
        const assertionsToExecute = assertFunc(new LowLevelAssert(this.ifNode));

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
     * Asserts that the else statement has the expected body.
     * @param {function} assertFunc - The assertion function to apply to the else statement body.
     * @returns {IfAssert} The instance of IfAssert for method chaining.
     */
    withElse(assertFunc) {
        if (!this.ifNode) return this;
        if (this.errors.length > 0) return this;

        // Execute the assertion function for the else statement body
        if (!assertFunc) return this;
        const assertionsToExecute = assertFunc(new LowLevelAssert(this.ifNode.orelse));

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
     * @returns {IfAssert} The current instance for chaining.
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
