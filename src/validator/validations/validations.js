// import { CodeSimulator } from "./simulation/simulator.js";
import { CodeSyntaxValidator } from "./syntax/code_syntax_validator.js";
import { CodeSimulator } from "./simulator/code_simulator.js";

/**
 * Initializes a new CodeSyntaxValidator instance with the provided Python code.
 * 
 * This method, also, validates the syntax of the provided Python code and throws a 
 * PythonSyntaxError exception if the syntax is invalid.
 *
 * @param {string} code - The Python code to validate.
 * @returns {Promise<CodeSyntaxValidatorCore>} Returns a new instance of CodeSyntaxValidator.
 * @throws {PythonSyntaxError} Throws a PythonSyntaxError if the syntax is invalid.
 */
export const SyntaxValidator = async (code) => {
    const validator = new CodeSyntaxValidator(code);
    await validator.validateSyntax();
    return validator;
};

export {CodeSimulator};