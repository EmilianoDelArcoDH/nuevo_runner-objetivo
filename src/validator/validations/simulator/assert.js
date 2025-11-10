import { InputExpectationStep } from "./input_expectation_step.js";
import { PrintExpectationStep } from "./print_expectation_step.js";


/**
 * Class representing an assertion simulator.
 */
export class Assert {
    /**
     * Create an Assert instance.
     * @param {Array} [expectations=[]] - The initial list of expectations.
     */
    constructor(expectations = []) {
        this.expectations = expectations;
    }

    /**
     * Add a print expectation step.
     * @param {*} expectedValue - The expected value to be printed.
     * @param {string} description - The description of the expectation.
     * @returns {PrintExpectationStep} The created print expectation step.
     */
    print(expectedValue, description) {
        const step = new PrintExpectationStep(expectedValue, description);
        this.expectations.push(step);
        return step;
    }

    /**
     * Add an input expectation step.
     * @param {string} prompt - The prompt message for the input.
     * @param {*} simulatedInput - The simulated input value.
     * @param {string} description - The description of the expectation.
     * @returns {InputExpectationStep} The created input expectation step.
     */
    input(prompt, simulatedInput, description) {
        const step = new InputExpectationStep(prompt, simulatedInput, description);
        this.expectations.push(step);
        return step;
    }

    /**
     * Get the list of expectations.
     * @returns {Array} The list of expectations.
     */
    getExpectations() {
        return this.expectations;
    }

    /**
     * Convert the expectations to a Python dictionary format.
     * @returns {string} The JSON string representing the expectations in Python dictionary format.
     */
    asPythonDict() {
        return JSON.stringify({
            expectations: this.expectations.map((exp) => ({
                operation: exp.operation,
                expected_value: exp.expectedValue,
                simulated_input: exp.simulatedInput,
                description: exp.description
            }))
        });
    }
}
