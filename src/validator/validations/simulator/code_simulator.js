import { Assert } from "./assert.js";
// const pyodide = require("pyodide");

/**
 * Class representing a code simulator for Python code, using Pyodide.
 */
export class CodeSimulator {
    /**
     * Create a CodeSimulator instance.
     * @param {string} code - The Python code to be simulated.
     */
    constructor(code) {
        this.code = code;
        this.pyodideReadyPromise = this.loadPyodide();
    }

    /**
     * Load Pyodide and set it to the instance.
     */
    async loadPyodide() {
        if (!window.pyodide) {
            const pyodideScript = document.createElement('script');
            pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
            document.head.appendChild(pyodideScript);

            await new Promise((resolve) => {
                pyodideScript.onload = resolve;
            });
        }

        this.pyodide = await loadPyodide();
    }

    /**
     * Simulate the code with the given test cases.
     * @param {string} lang - The language of the error messages.
     * @param  {...any} testCases - The test cases to be simulated.
     * @returns {Array} The results of the simulation.
     * @async
     */
    async simulate(lang, ...testCases) {
        await this.pyodideReadyPromise;

        let allResults = [];

        for (const testCase of testCases) {
            if(!testCase){
                continue
            }
            if (typeof testCase.test !== 'function' ) {
                continue;
            }
            const assert = new Assert();

            testCase.test(assert);

            const simulationCode = `
import builtins
from io import StringIO
from typing import List, Dict, Union, Any

def validate_expectations(expectations: Dict[str, List[Dict[str, Union[str, Any]]]], code: str) -> List[Dict[str, Union[str, Any]]]:
    """
    Validates the expectations against the provided code.
    This function mocks the built-in print and input functions to capture their outputs and inputs
    during the execution of the provided code. It then compares the captured outputs and inputs against
    the expected values provided in the expectations dictionary.
    Args:
        expectations (Dict[str, List[Dict[str, Union[str, Any]]]]): A dictionary containing the expectations.
            The dictionary should have a key "expectations" which maps to a list of expectation dictionaries.
            Each expectation dictionary should have the following keys:
                - "operation" (str): The operation type, either "print" or "input".
                - "expected_value" (str): The expected value for the operation.
        code (str): The code to be executed and validated.
    Returns:
        List[Dict[str, Union[str, Any]]]: A list of remaining expectations that were not met during the code execution.
            Each dictionary in the list will have the same structure as the input expectations.
    """
    original_print = builtins.print
    original_input = builtins.input
    
    output = StringIO()
    def mock_print(*args, **kwargs):
        original_print(*args, **kwargs, file=output)
    builtins.print = mock_print
    
    input_values = [exp["expected_value"] for exp in expectations["expectations"] if exp["operation"] == "input"]
    input_index = 0
    input_called = False  # Track if input is actually called
    
    def mock_input(prompt=""):
        nonlocal input_index, input_called
        input_called = True
        if input_index < len(input_values):
            value = input_values[input_index]
            input_index += 1
            return value
        return ""
    
    builtins.input = mock_input
    
    try:
        exec(code)
    except Exception as e:
        builtins.print = original_print
        builtins.input = original_input
        return [{"description": f"Error executing code: {e}"}]
    
    output_lines = output.getvalue().strip().splitlines()
    remaining_expectations = []

    # Check each expectation in order
    for exp in expectations["expectations"]:
        if exp["operation"] == "print":
            if exp["expected_value"] in output_lines:
                output_lines.remove(exp["expected_value"])
            else:
                remaining_expectations.append(exp)
        elif exp["operation"] == "input":
            # If the input was called but not matched, just enter a empty string
            if input_called and input_index == 0:
                input_values.insert(0, "")

            # Check if the input was called and matched the expected value
            if input_called and input_index > 0 and exp["expected_value"] == input_values[input_index - 1]:
                input_index -= 1  # Adjust index as we already processed this input expectation
            else:
                # If the input was not called or did not match, add it to remaining expectations
                remaining_expectations.append(exp)

    builtins.print = original_print
    builtins.input = original_input

    return remaining_expectations

remaining = validate_expectations(${assert.asPythonDict()},${this.code})
{
    "success": len(remaining) == 0,
    "unmet_expectations": remaining
}
`;
            const jsResult = this.pyodide.runPython(simulationCode).toJs();

            if (!jsResult.success) {
                //console.log("Unmet expectations:", jsResult.unmet_expectations);
                const unmetExpectation = jsResult.unmet_expectations[0];
                const failedStep = assert.getExpectations().find(
                    (exp) => exp.operation === unmetExpectation.operation && exp.expectedValue === unmetExpectation.expected_value
                );
                allResults.push({
                    success: false,
                    description: testCase.description,
                    error: failedStep ? failedStep.getErrorMessage(lang) : "Error en la simulación",
                });
                break;
            } else {
                allResults.push({
                    success: true,
                    description: testCase.description,
                    error: null,
                });
            }
        }

        return allResults;
    }
}
