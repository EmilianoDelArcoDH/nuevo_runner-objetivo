import { CodeSyntaxValidatorError } from "./code_syntax_validator_error.js";


export class ErrorImportNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorImportNotExists.
     * @param {string} library - The expected library in the import
     */
    constructor(library) {
        super("import", `Import statement for ${library} does not exist.`);
    }
}

export class ErrorImportFromNotExists extends CodeSyntaxValidatorError {
    /**
     * Creates an instance of ErrorImportFromNotExists.
     * @param {string} library - The expected library in the "from" clause.
     * @param {string} valueToImport - The expected value to import from the library.
     */
    constructor(library, valueToImport) {
        super("import", `${valueToImport} is not imported from ${library}.`);
    }
}

export class ImportAssert {
    /**
     * Creates an instance of ImportAssert.
     * @param {Object} node - The node containing the import statement.
     * @param {string} expectedImport - The expected value of the import statement.
     */
    constructor(node, expectedImport) {
        this.node = node;
        this.errors = [];
        this.expectedImport = expectedImport;
        
        this.importNode = this.checkImportExists();
    }

    /**
     * Checks if the import statement exists in the node.
     * @returns {Object|null} The import node if it exists, otherwise null.
     */
    checkImportExists() {
        // Search through the node's body to find the import statement
        let foundChildNode;
        for (const childNode of this.node.body) {
            if (!childNode) continue;
            if (childNode.type !== 'ImportNode') continue;

            if (childNode.from === null) {
                if (childNode.import === this.expectedImport) {
                    foundChildNode = childNode;
                    break;
                }
            }

            if (childNode.import === this.expectedImport) {
                foundChildNode = childNode;
                break;
            }
        }
        if (!foundChildNode) {
            this.errors.push(new ErrorImportNotExists(this.expectedImport));
            return null;
        }

        return foundChildNode;
    }

    /**
     * Checks if the import statement contains a "from" clause.
     * @param {String} expectedFrom - The expected value of the "from" clause.
     * @returns {ImportAssert} The instance of ImportAssert.
     */
    from(expectedFrom) {
        if (!this.importNode) return this;
        if (this.errors.length > 0) return this;
        const actualFrom = this.importNode.from;
        if (actualFrom !== expectedFrom) {
            this.errors.push(new ErrorImportFromNotExists(expectedFrom, this.expectedImport));
        }
        return this;
    }

    // /**
    //  * Catch any errors that occur during the assertions and return a translated error message.
    //  * @param {Object} messages - An object containing translations for the error messages.
    //  * @returns {ImportAssert} The current instance for chaining.
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
