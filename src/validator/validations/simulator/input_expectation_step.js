import { ExpectationStep } from "./expectation_step.js";


/**
 * Represents a step in the simulation where an input is expected.
 */
export class InputExpectationStep extends ExpectationStep {
    constructor(prompt, simulatedInput, description) {
        super("input", simulatedInput, description);
        this.prompt = prompt;
    }
}
