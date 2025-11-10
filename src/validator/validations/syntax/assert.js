import { ClassAssert } from "./class_assert.js";
import { ForAssert } from "./for_assert.js";
import { FunctionAssert } from "./function_assert.js";
import { FunctionCallAssert } from "./function_call_assert.js";
import { IfAssert } from "./if_assert.js";
import { ImportAssert } from "./import_assert.js";
import { ReturnAssert } from "./return_assert.js";
import { VariableAssert } from "./variable_assert.js";
import { WhileAssert } from "./while_assert.js";

export class Assert {
    constructor(module, code) {
        this.module = module;
        this.code = code;
    }

    $function(name) {
        return new FunctionAssert(this.module, name);
    }

    $class(name) {
        return new ClassAssert(this.module, name);
    }

    $variable(name) {
        return new VariableAssert(this.module, name);
    }

    $return(value) {
        return new ReturnAssert(this.module, value);
    }

    $functionCall(name) {
        return new FunctionCallAssert(this.module, name);
    }

    $if(condition) {
        return new IfAssert(this.module, condition);
    }

    $for(condition) {
        return new ForAssert(this.module, condition);
    }

    $while(condition) {
        return new WhileAssert(this.module, condition);
    }

    $import(library) {
        return new ImportAssert(this.module, library);
    }

    $custom(test) {
        return new CustomAssert(this.code, this.module, test);
    }

    test() {
        return this.errors;
    }
}

/**
 * Class to perform low-level assertions on a given node.
 */
export class LowLevelAssert {
    /**
     * Creates an instance of LowLevelAssert.
     * @param {Object} node - The node to be asserted.
     */
    constructor(node) {
        this.node = node;
        this.errors = [];
    }

    /**
     * Asserts properties of a function by its name.
     * @param {string} name - The name of the function to assert.
     * @returns {FunctionAssert} An instance of FunctionAssert for further assertions.
     */
    $function(name) {
        return new FunctionAssert(this.node, name);
    }

    /**
     * Asserts properties of a variable by its name.
     * @param {string} name - The name of the variable to assert.
     * @returns {VariableAssert} An instance of VariableAssert for further assertions.
     */
    $variable(name) {
        return new VariableAssert(this.node, name);
    }

    /**
     * Asserts properties of a return statement.
     * @param {any} value - The expected return value to assert.
     * @returns {ReturnAssert} An instance of ReturnAssert for further assertions.
     */
    $return(value) {
        return new ReturnAssert(this.node, value);
    }

    /**
     * Asserts properties of a function call by its name.
     * @param {string} name - The name of the function call to assert.
     * @returns {FunctionCallAssert} An instance of FunctionCallAssert for further assertions.
     */
    $functionCall(name) {
        return new FunctionCallAssert(this.node, name);
    }

    /**
     * Asserts properties of an if statement by its condition.
     * @param {string} condition - The condition of the if statement to assert.
     * @returns {IfAssert} An instance of IfAssert for further assertions.
     */
    $if(condition) {
        return new IfAssert(this.node, condition);
    }

    /**
     * Asserts properties of a for loop by its condition.
     * @param {string} condition - The condition of the for loop to assert.
     * @returns {ForAssert} An instance of ForAssert for further assertions.
     */
    $for(condition) {
        return new ForAssert(this.node, condition);
    }

    /**
     * Asserts properties of a while loop by its condition.
     * @param {string} condition - The condition of the while loop to assert.
     * @returns {WhileAssert} An instance of WhileAssert for further assertions.
     */
    $while(condition) {
        return new WhileAssert(this.node, condition);
    }

    /**
     * Returns the accumulated errors from the assertions.
     * @returns {Array} An array of error instances encountered during the assertions.
     */
    test() {
        return this.errors;
    }
}

class CustomAssert {
    constructor(code, module, testFunc) {
        this.code = code;
        this.module = module;
        this.testFunc = testFunc;
    }

    test() {
        return this.testFunc(this.code, this.module);
    }
}