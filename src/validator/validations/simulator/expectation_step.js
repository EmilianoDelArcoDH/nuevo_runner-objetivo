/**
 * Class representing an expectation step in a simulation.
 */
export class ExpectationStep {
    /**
     * Create an ExpectationStep.
     * @param {string} operation - The operation to be performed.
     * @param {*} expectedValue - The expected value of the operation.
     * @param {string} description - A description of the expectation step.
     */
    constructor(operation, expectedValue, description) {
        this.operation = operation;
        this.expectedValue = expectedValue;
        this.description = description;
        this.errorMessages = {};
    }

    /**
     * Catch and store error messages.
     * @param {Object} errorMessages - An object containing error messages.
     * @returns {ExpectationStep} The current instance of ExpectationStep.
     */
    catch(errorMessages) {
        this.errorMessages = errorMessages;
        return this;
    }

    /**
     * Get the error message for a specific language.
     * @param {string} lang - The language code for the error message.
     * @returns {string} The error message in the specified language, or a default message if not found.
     */
    getErrorMessage(lang) {
        return this.errorMessages[lang] || this.errorMessages['en'] || "An error occurred";
    }
}
