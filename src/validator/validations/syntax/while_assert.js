import { LowLevelAssert } from "./assert.js";
import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Error class indicating that a while statement does not exist in the node.
 */
export class ErrorWhileStatementNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorWhileStatementNotExists.
     */
    constructor() {
        super("while statement", `While statement does not exist in node.`);
    }
}

/**
 * Class to perform assertions on while statements within a node.
 */
export class WhileAssert {
    /**
     * Creates an instance of WhileAssert.
     * @param {Object} node - The node containing the while statement.
     * @param {string} condition - The expected condition of the while statement.
     */
    constructor(node, condition) {
        this.node = node;
        this.errors = [];
        this.condition = condition;

        this.whileNode = this.checkWhileStatementExists();
    }

    /**
     * Obtains the condition of a while node.
     * @param {Object} node - The while node to extract the condition from.
     * @returns {string|null} The condition as a string or null if no condition exists.
     */
    obtainCondition(node) {
        if (!node.test) return null;

        const left = node.test.left.id;
        const operator = node.test.operator;
        const right = node.test.right.value;
        return `${left} ${operator} ${right}`;
    }

    /**
     * Checks if the while statement exists in the node and matches the expected condition.
     * @returns {Object|null} The while statement node if it exists and matches the condition, otherwise null.
     */
    checkWhileStatementExists() {
        let foundChildNode;

        // Search through the node's body to find the while statement
        for (const childNode of this.node.body) {
            if (!childNode) continue;
            if (childNode.type === 'WhileNode') {
                foundChildNode = childNode;
                break;
            }
        }
        if (!foundChildNode) {
            this.errors.push(new ErrorWhileStatementNotExists());
            return null;
        }

        // Check if the while statement condition matches the expected condition
        const actualCondition = this.obtainCondition(foundChildNode);
        if (actualCondition !== this.condition) {
            this.errors.push(new ErrorWhileStatementNotExists());
            return null;
        }

        return foundChildNode;
    }

    /**
     * Asserts that the while statement has the expected body.
     * @param {function} assertFunc - The assertion function to apply to the while statement body.
     * @returns {WhileAssert} The instance of WhileAssert for method chaining.
     */
    withBody(assertFunc) {
        if (!this.whileNode) return this;
        if (this.errors.length > 0) return this;

        // Execute the assertion function for the while statement body
        if (!assertFunc) return this;
        const assertionsToExecute = assertFunc(new LowLevelAssert(this.whileNode));

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

    // /**
    //  * Catch any errors that occur during the assertions and return a translated error message.
    //  * @param {Object} messages - An object containing translations for the error messages.
    //  * @returns {WhileAssert} The current instance for chaining.
    //  */
    // catch(messages) {
    //     if (this.errors.length <= 1) return this;

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
