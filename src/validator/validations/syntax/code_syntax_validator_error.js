/**
 * Class representing an error in code validation.
 */
export class CodeSyntaxValidatorError extends Error {
    /**
     * An object that holds translated error messages.
     * The keys are error codes and the values are the corresponding translated messages.
     * @type {Object.<string, string>}
     */
    translatedMessages = null;

    /**
     * Creates an instance of CodeSyntaxValidatorError.
     *
     * @param {string} methodName - The name of the method that failed.
     * @param {string} message - The error message.
     */
    constructor(methodName, message) {
        super(message);
        this.name = 'CodeValidatorError';
        this.methodName = methodName;
    }

    /**
     * Returns a string representation of the error.
     *
     * @returns {string} The formatted error message.
     */
    toString() {
        return `${this.name} in ${this.methodName}: ${this.message}`;
    }
}
