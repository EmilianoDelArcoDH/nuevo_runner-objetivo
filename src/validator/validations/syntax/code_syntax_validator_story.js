import { Assert } from "./assert.js";

/**
 * Class representing a story for validating code syntax.
 */
export class CodeSyntaxValidationStory {
    /**
     * Creates an instance of CodeSyntaxValidationStory.
     * @param {Object} validator - The validator object that contains validation logic.
     * @param {string} storyName - The name of the story for reference.
     */
    constructor(validator, storyName) {
        this.validator = validator;
        this.storyName = storyName;
        this.storyErrors = [];
    }

    /**
     * Asserts one or more assertion functions against the validator.
     * Executes each assertion function and collects errors if present.
     * 
     * @param {...function} assertionFunctions - One or more assertion functions to be executed.
     * @returns {Array} An array containing any errors encountered during the assertions.
     */
    assert(...assertionFunctions) {
        // Iterate through each assertion function and execute it.
        assertionFunctions.forEach(assertionFunc => {
            // Create a new assert object.
            let assert = new Assert(this.validator.module, this.validator.code);

            // Execute the assertion function, obtaining the errors.
            assert = assertionFunc(assert);

            // Store the errors in the storyErrors array.
            if (!assert.test) {
                // Okay! We have an array of assertions to invoke.
                assert.forEach(assertion => {
                    const errors = assertion.test();
                    this.storyErrors.push(...errors);
                });
                return;
            }

            // We have an array of errors.
            const errors = assert.test();
            if (!errors || errors.length === 0) return;
            this.storyErrors.push(...errors);
        });

        // Return the errors from the story.
        return this.storyErrors;
    }
}
