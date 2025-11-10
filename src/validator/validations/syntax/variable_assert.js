import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";

/**
 * Error class indicating that a specified variable does not exist.
 */
export class ErrorVariableNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorVariableNotExists.
     * @param {string} name - The name of the variable that does not exist.
     */
    constructor(name) {
        super("variable", `Variable ${name} does not exist in node.`);
    }
}

/**
 * Error class indicating that a variable has an incorrect assignation.
 */
export class ErrorVariableAssignation extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorVariableAssignation.
     * @param {string} name - The name of the variable.
     * @param {string} expectedAssignation - The expected assignation of the variable.
     * @param {string} actualAssignation - The actual assignation of the variable.
     */
    constructor(name, expectedAssignation, actualAssignation) {
        super("variable", `Variable ${name} has assignation ${actualAssignation}, expected ${expectedAssignation}.`);
    }
}

/**
 * Class to perform assertions on a specified variable within a node.
 */
export class VariableAssert {
    /**
     * Creates an instance of VariableAssert.
     * @param {Object} node - The node containing the variable.
     * @param {string} name - The name of the variable to assert.
     */
    constructor(node, name) {
        this.node = node;
        this.name = name;
        this.errors = [];

        this.variableNode = this.checkVariableExists();
    }

    /**
     * Checks if the variable exists in the node.
     * @returns {Object|null} The variable node if it exists, otherwise null.
     */
    checkVariableExists() {
        // Search through the node's body to find the variable
        for (const childNode of this.node.body) {
            if (!childNode) continue;
            let variableName;
            switch (childNode.type) {
                case 'VariableAssignNode':
                    variableName = childNode.targets[0].id;
                    break;
                case 'AugAssignNode':
                    variableName = childNode.target.id;
                    break;
                default:
                    continue;
            }
            if (variableName === this.name) {
                return childNode;
            }
        }

        // If the variable does not exist, return an error
        this.errors.push(new ErrorVariableNotExists(this.name));
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
     * Asserts that the variable has the expected assignation.
     * @param {string} expectedAssignation - The expected assignation of the variable.
     * @returns {VariableAssert} The instance of VariableAssert for method chaining.
     */
    withAssignation(expectedAssignation) {
        if (!this.variableNode) return this;
        if (this.errors.length > 0) return this;

        // Check if it is an attribute assignation
        let actualAssignation;
        if (this.variableNode.type === 'VariableAssignNode') {
            switch (this.variableNode.value.type) {
                case 'AttributeNode':
                    actualAssignation = `${this.variableNode.value.value.id}.${this.variableNode.value.attr}`;
                    break;
                case 'ConstantNode':
                    actualAssignation = this.variableNode.value.value;
                    break;
                case 'CallNode':
                    actualAssignation = this.deconstructCallNode(this.variableNode.value);
                    break;
                default:
                    actualAssignation = this.variableNode.value.id;
            }
        }

        if (this.variableNode.type === 'AugAssignNode') {
            actualAssignation = `${this.variableNode.target.id} ${this.variableNode.operator} ${this.variableNode.value.value}`;
        }

        // Check if the variable assignation matches the expected assignation
        if (actualAssignation !== expectedAssignation) {
            this.errors.push(new ErrorVariableAssignation(this.name, expectedAssignation, actualAssignation));
            return this;
        }

        return this;
    }

    // /**MATHI
    //  * Catch any errors that occur during the assertions and return a translated error message.
    //  * @param {Object} messages - An object containing translations for the error messages.
    //  * @returns {VariableAssert} The current instance for chaining.
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
