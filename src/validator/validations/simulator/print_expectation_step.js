import { ExpectationStep } from "./expectation_step.js";


/**
 * Class representing a print expectation step.
 * @extends ExpectationStep
 */
export class PrintExpectationStep extends ExpectationStep {
    constructor(expectedValue, description) {
        super("print", expectedValue, description);
    }
}
