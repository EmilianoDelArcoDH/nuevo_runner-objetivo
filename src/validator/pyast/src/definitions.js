/* eslint-disable no-unused-vars */
import { ASTNode } from "./ast_node.js";

/**
 * Main parsing function to parse the entire AST.
 * If a node type is unknown, it will log a warning and return a null value for that node.
 * @param {Object} node - The JSON representation of the AST.
 * @param {String} code - The Python code to parse.
 * @returns {ASTNode} The parsed ASTNode.
 */
export const parseNode = (node, code) => {
    switch (node.type) {
        case "Module":
            return Module.parse(node, code);
        case "If":
            return IfNode.parse(node, code);
        case "FunctionDef":
            return FunctionNode.parse(node, code);
        case "Return":
            return ReturnNode.parse(node, code);
        case "ClassDef":
            return ClassNode.parse(node, code);
        case "Name":
            return NameNode.parse(node, code);
        case "Constant":
            return ConstantNode.parse(node, code);
        case "BinOp":
            return BinOpNode.parse(node, code);
        case "Call":
            return CallNode.parse(node, code);
        case "Assign":
            return VariableAssignNode.parse(node, code);
        case "Attribute":
            return AttributeNode.parse(node, code);
        case "Expr":
            return ExpressionNode.parse(node, code);
        case "For":
            return ForNode.parse(node, code);
        case "While":
            return WhileNode.parse(node, code);
        case "Compare":
            return CompareNode.parse(node, code);
        case "AugAssign":
            return AugAssignNode.parse(node, code);
        case "Import":
            return ImportNode.parse(node, code);
        case "ImportFrom":
            return ImportNode.parse(node, code);
        case "JoinedStr":
            return JoinedStrNode.parse(node, code);
        default:
            console.warn(`Unknown node type: ${node.type}`);
            return null;
    }
};

/**
 * Node that represents a module in the Python AST.
 * @extends ASTNode
 */
export class Module extends ASTNode {
    /**
     * Creates an instance of Module.
     * @param {ASTNode[]} body - The body of the module.
     */
    constructor(body) {
        super("Module");
        this.body = body;
    }

    /**
     * Parses a Module from JSON.
     * @param {Object} json - The JSON representation of the module node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {Module} The parsed Module.
     */
    static parse(json, code) {
        const body = json.fields.body.map((node) => parseNode(node, code));
        return new Module(body);
    }
}


export class FunctionArgumentNode extends ASTNode {
    constructor(name, type) {
        super("FunctionArgumentNode");
        this.name = name;
        this.type = type;
    }

    /**
     * Parses a FunctionArgumentNode from JSON.
     * @param {Object} json - The JSON representation of the argument node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {FunctionArgumentNode} The parsed FunctionArgumentNode.
     */
    static parse(json, code) {
        const name = json.fields.arg;
        const type = json.fields.annotation ?json.fields.annotation.fields.id : "any";
        return new FunctionArgumentNode(name, type);
    }
}

/**
 * Node that represents a function definition in the Python AST.
 * @extends ASTNode
 */
export class FunctionNode extends ASTNode {
    /**
     * Creates an instance of FunctionNode.
     * @param {string} name - The name of the function.
     * @param {FunctionArgumentNode[]} args - The arguments of the function.
     * @param {ASTNode[]} body - The body of the function.
     * @param {string} returnType - The return type of the function.
     */
    constructor(name, args, body, returnType) {
        super("FunctionNode");
        this.name = name;
        this.args = args;
        this.body = body;
        this.returnType = returnType;
    }

    /**
     * Parses a FunctionNode from JSON.
     * @param {Object} json - The JSON representation of the function node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {FunctionNode} The parsed FunctionNode.
     */
    static parse(json, code) {
        const name = json.fields.name;
        const args = json.fields.args.fields.args.map((arg) => FunctionArgumentNode.parse(arg, code));
        const body = json.fields.body.map((node) => parseNode(node, code));
        const returnType = json.fields.returns ? json.fields.returns.fields.id : "any";
        return new FunctionNode(name, args, body, returnType);
    }
}


/**
 * Node that represents a method definition in a class.
 * @extends FunctionNode
 */
export class MethodNode extends FunctionNode {
    /**
     * Creates an instance of MethodNode.
     * @param {string} name - The name of the method.
     * @param {FunctionArgumentNode[]} args - The arguments of the method.
     * @param {ASTNode[]} body - The body of the method.
     * @param {string} returnType - The return type of the method.
     */
    constructor(name, args, body, returnType) {
        super(name, args, body, returnType);
        this.nodeType = "MethodNode";
    }

    /**
     * Parses a MethodNode from JSON.
     * @param {Object} json - The JSON representation of the method node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {MethodNode} The parsed MethodNode.
     */
    static parse(json, code) {
        const name = json.fields.name;
        const args = json.fields.args.fields.args.map((arg) => FunctionArgumentNode.parse(arg, code));
        const body = json.fields.body.map((node) => parseNode(node, code));
        const returnType = json.fields.returns ? json.fields.returns.fields.id : "any";
        return new MethodNode(name, args, body, returnType);
    }
}

/**
 * Node that represents a class definition in the Python AST.
 * @extends ASTNode
 */
export class ClassNode extends ASTNode {
    /**
     * Creates an instance of ClassNode.
     * @param {string} name - The name of the class.
     * @param {ASTNode} constructor - The constructor of the class.
     * @param {MethodNode[]} methods - The methods of the class.
     */
    constructor(name, constructor, methods) {
        super("ClassNode");
        this.name = name;
        this.constructor = constructor;
        this.methods = methods;
    }

    /**
     * Parses a ClassNode from JSON.
     * @param {Object} json - The JSON representation of the class node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {ClassNode} The parsed ClassNode.
     */
    static parse(json, code) {
        const name = json.fields.name;
        const constructor = json.fields.body.find((node) => node.fields.name === "__init__");
        const methods = json.fields.body.filter((node) => node.fields.name !== "__init__").map((node) => MethodNode.parse(node, code));
        return new ClassNode(
            name, 
            constructor ? MethodNode.parse(constructor, code) : null, 
            methods,
        );
    }
}

/**
 * Node that represents an If statement in the Python AST.
 * @extends ASTNode
 */
export class IfNode extends ASTNode {
    /**
     * Creates an instance of IfNode.
     * @param {string} condition - The condition of the if statement.
     * @param {ASTNode[]} body - The body of the if statement.
     * @param {IfNode[]} [orelse] - The body of the else statement (optional).
    */
    constructor(condition, body, orelse = []) {
        super("IfNode");
        this.condition = condition;
        this.body = body;
        this.orelse = orelse;
    }
    /**
     * Parses an IfNode from JSON.
     * @param {Object} json - The JSON representation of the if node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug in the Pyodide AST parser.
     * @returns {IfNode} The parsed IfNode.
     */
    static parse(json, code) {
        // Initialize condition and handle extraction
        let condition = this.extractCondition(json, code);

        // Parse the body of the if statement
        const body = json.fields.body.map((node) => parseNode(node, code));

        // Parse the else statement, if any
        const orelse = json.fields.orelse.length > 0 
                        ? json.fields.orelse.map((node) => parseNode(node, code))
                        : [];

        return new IfNode(condition, body, orelse);
    }

    /**
     * Extracts the condition from the if node in JSON or from the raw code if needed.
     * @param {Object} json - The JSON representation of the if node.
     * @param {String} code - The Python code to extract the condition from.
     * @returns {String} The parsed condition.
     */
    static extractCondition(json, code) {
        if (json.fields.test.fields && !json.fields.test.fields.left) {
            // Extract condition from raw code if no left field is available
            const { lineno, col_offset } = json;
            const line = code.split("\n")[lineno - 1];
            const start = line.indexOf("if") + 3;
            const end = line.indexOf(":");
            return line.substring(start, end).trim() || "UNKNOWN";
        }

        // Handle comparisons
        const comparers = {
            Eq: "==",
            NotEq: "!=",
            Lt: "<",
            LtE: "<=",
            Gt: ">",
            GtE: ">="
        };

        // Extract the left side of the condition
        const left = this.extractExpression(json.fields.test.fields.left);

        // Get the operator and value for comparison
        const operator = comparers[json.fields.test.fields.ops[0].type];

        // Extract the right side (comparator) of the condition
        const right = this.extractExpression(json.fields.test.fields.comparators[0]);

        // Combine the left, operator, and right into a condition string
        return `${left} ${operator} ${right}`;
    }

    /**
     * Extracts an expression from the JSON, handling function calls, attribute access, and simple names.
     * This works for both the left and right sides of a comparison.
     * @param {Object} expr - The expression field from the JSON.
     * @returns {String} The extracted expression.
     */
    static extractExpression(expr) {
        const handlers = {
            "Call": (expr) => {
                const funcName = expr.fields.func.fields.attr || expr.fields.func.fields.id;
                const obj = expr.fields.func.fields.value.fields.id;

                // Extract arguments if present
                const args = expr.fields.args.length > 0
                    ? expr.fields.args.map(this.extractExpression).join(", ")
                    : "";

                return args ? `${obj}.${funcName}(${args})` : `${obj}.${funcName}()`;
            },
            "Attribute": (expr) => {
                const obj = expr.fields.value.fields.id;
                const attr = expr.fields.attr;
                return `${obj}.${attr}`;
            },
            "Name": (expr) => expr.fields.id,
            "Constant": (expr) => {
                const value = expr.fields.value;
                return typeof value === "string" ? `"${value}"` : value;
            }
        };

        return handlers[expr.type] ? handlers[expr.type](expr) : "UNKNOWN";
    }
}

/**
 * Node that represents a return statement in the Python AST.
 * @extends ASTNode
 */
export class ReturnNode extends ASTNode {
    /**
     * Creates an instance of ReturnNode.
     * @param {ASTNode} value - The value to return.
     */
    constructor(value) {
        super("ReturnNode");
        this.value = value;
    }

    /**
     * Parses a ReturnNode from JSON.
     * @param {Object} json - The JSON representation of the return node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {ReturnNode} The parsed ReturnNode.
     */
    static parse(json, code) {
        const value = parseNode(json.fields.value, code);
        return new ReturnNode(value);
    }
}

/**
 * Node that represents a name in the Python AST.
 * @extends ASTNode
 */
export class NameNode extends ASTNode {
    /**
     * Creates an instance of NameNode.
     * @param {string} id - The name of the variable.
     */
    constructor(id) {
        super("NameNode");
        this.id = id;
    }

    /**
     * Parses a NameNode from JSON.
     * @param {Object} json - The JSON representation of the name node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly
     * @returns {NameNode} The parsed NameNode.
     */
    static parse(json, code) {
        return new NameNode(json.fields.id);
    }
}

/**
 * Node that represents a constant in the Python AST.
 * @extends ASTNode
 */
export class ConstantNode extends ASTNode {
    /**
     * Creates an instance of ConstantNode.
     * @param {any} value - The value of the constant.
     */
    constructor(value) {
        super("ConstantNode");
        this.value = value;
    }

    /**
     * Parses a ConstantNode from JSON.
     * @param {Object} json - The JSON representation of the constant node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {ConstantNode} The parsed ConstantNode.
     */
    static parse(json, code) {
        // Preserve ticks in the string.
        // For example:
        // "Hello, 'world'!" should be preserved as "Hello, 'world'!"
        // `Hello, 'world'!` should be preserved as `Hello, 'world'!`
        let value = json.fields.value;
        if (typeof value === "string") {
            // Check which tick is used in the string
            const pythonTicks = ["'", '"', "`"];
            const tick = pythonTicks.find((t) => value.startsWith(t));

            // If there is no tick, then it is a normal string.
            if (!tick) {
                // Put "" around the string
                value = `"${value}"`;
                return new ConstantNode(value);
            }

            // Find the end of the string
            const end = value.lastIndexOf(tick);
            value = value.substring(1, end);

            // Add the tick back to the string
            value = tick + value + tick;
        }
        return new ConstantNode(value);
    }
}

/**
 * Node that represents a binary operation in the Python AST.
 * @extends ASTNode
 */
export class BinOpNode extends ASTNode {
    /**
     * Creates an instance of BinOpNode.
     * @param {ASTNode} left - The left operand.
     * @param {string} operator - The operator (e.g., "+", "-", "*").
     * @param {ASTNode} right - The right operand.
     */
    constructor(left, operator, right) {
        super("BinOpNode");
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    /**
     * Parses a BinOpNode from JSON.
     * @param {Object} json - The JSON representation of the binary operation node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {BinOpNode} The parsed BinOpNode.
     */
    static parse(json, code) {
        const operatorMap = {
            Add: "+",
            Sub: "-",
            Mult: "*",
            Div: "/",
            FloorDiv: "//",
            Mod: "%",
            Pow: "**",
            LShift: "<<",
            RShift: ">>",
            BitOr: "|",
            BitXor: "^",
            BitAnd: "&",
            MatMult: "@",
        };

        const left = parseNode(json.fields.left, code);
        const operator = operatorMap[json.fields.op.type];
        const right = parseNode(json.fields.right, code);
        return new BinOpNode(left, operator, right);
    }
}

/**
 * Node that represents a function call in the Python AST.
 * @extends ASTNode
 */
export class CallNode extends ASTNode {
    /**
     * Creates an instance of CallNode.
     * @param {ASTNode} func - The function being called.
     * @param {ASTNode[]} args - The arguments to the function.
     */
    constructor(func, args) {
        super("CallNode");
        this.func = func;
        this.args = args;
    }

    /**
     * Parses a CallNode from JSON.
     * @param {Object} json - The JSON representation of the call node.
     * @param {String} code - The Python code to parse. This is necessary due to a bug into the Pyodide AST parser, where the BinOp node is not parsed correctly.
     * @returns {CallNode} The parsed CallNode.
     */
    static parse(json, code) {
        const func = parseNode(json.fields.func, code);
        const args = json.fields.args.map((arg) => parseNode(arg, code));
        return new CallNode(func, args);
    }
}

/**
 * Node that represents a variable assignment in the Python AST.
 * @extends ASTNode
 */
export class VariableAssignNode extends ASTNode {
    /**
     * Creates an instance of VariableAssignNode.
     * @param {ASTNode[]} targets - The targets of the assignment.
     * @param {ASTNode} value - The value being assigned.
     */
    constructor(targets, value) {
        super("VariableAssignNode");
        this.targets = targets;
        this.value = value;
    }

    /**
     * Parses a VariableAssignNode from JSON.
     * @param {Object} json - The JSON representation of the assignment node.
     * @param {String} code - The Python code to parse.
     * @returns {VariableAssignNode} The parsed VariableAssignNode.
     */
    static parse(json, code) {
        const targets = json.fields.targets.map((target) => parseNode(target, code));
        const value = parseNode(json.fields.value, code);
        return new VariableAssignNode(targets, value);
    }
}

/**
 * Node that represents an attribute in the Python AST.
 * @extends ASTNode
 */
export class AttributeNode extends ASTNode {
    /**
     * Creates an instance of AttributeNode.
     * @param {ASTNode} value - The value of the attribute.
     * @param {string} attr - The attribute name.
     */
    constructor(value, attr) {
        super("AttributeNode");
        this.value = value;
        this.attr = attr;
    }

    /**
     * Parses an AttributeNode from JSON.
     * @param {Object} json - The JSON representation of the attribute node.
     * @param {String} code - The Python code to parse.
     * @returns {AttributeNode} The parsed AttributeNode.
     */
    static parse(json, code) {
        const value = parseNode(json.fields.value, code);
        const attr = json.fields.attr;
        return new AttributeNode(value, attr);
    }
}

/**
 * Node that represents an expression in the Python AST.
 * @extends ASTNode
 */
class ExpressionNode extends ASTNode {
    /**
     * Creates an instance of ExprNode.
     * 
     * @constructor
     * @param {*} value - The value to be assigned to the node.
     */
    constructor(value) {
        super("ExprNode");
        this.value = value;
    }

    /**
     * Parses a JSON object and code to create an ExpressionNode.
     *
     * @param {Object} json - The JSON object containing the fields to parse.
     * @param {string} code - The code associated with the JSON object.
     * @returns {ExpressionNode} The resulting ExpressionNode after parsing.
     */
    static parse(json, code) {
        const value = parseNode(json.fields.value, code);
        return new ExpressionNode(value);
    }
}

/**
 * Node that represents a for loop in the Python AST.
 * @extends ASTNode
 */
export class ForNode extends ASTNode {
    /**
     * Creates an instance of ForNode.
     * @param {string} target - The target of the loop.
     * @param {ASTNode} iter - The iterable to loop over.
     * @param {ASTNode[]} body - The body of the loop.
     */
    constructor(target, iter, body) {
        super("ForNode");
        this.target = target;
        this.iter = iter;
        this.body = body;
    }

    /**
     * Parses a ForNode from JSON.
     * @param {Object} json - The JSON representation of the for loop node.
     * @param {String} code - The Python code to parse.
     * @returns {ForNode} The parsed ForNode.
     */
    static parse(json, code) {
        const target = json.fields.target.fields.id;
        const iter = parseNode(json.fields.iter, code);
        const body = json.fields.body.map((node) => parseNode(node, code));
        return new ForNode(target, iter, body);
    }
}

/**
 * Node that represents a while loop in the Python AST.
 * @extends ASTNode
 */
export class WhileNode extends ASTNode {
    /**
     * Creates an instance of WhileNode.
     * @param {ASTNode} test - The test condition of the loop.
     * @param {ASTNode[]} body - The body of the loop.
     */
    constructor(test, body) {
        super("WhileNode");
        this.test = test;
        this.body = body;
    }

    /**
     * Parses a WhileNode from JSON.
     * @param {Object} json - The JSON representation of the while loop node.
     * @param {String} code - The Python code to parse.
     * @returns {WhileNode} The parsed WhileNode.
     */
    static parse(json, code) {
        const test = parseNode(json.fields.test, code);
        const body = json.fields.body.map((node) => parseNode(node, code));
        return new WhileNode(test, body);
    }
}




/**
 * Node that represents a comparison operation in the Python AST.
 * @extends ASTNode
 */
export class CompareNode extends ASTNode {
    /**
     * Creates an instance of CompareNode.
     * @param {ASTNode} left - The left operand of the comparison.
     * @param {string} operator - The comparison operator.
     * @param {ASTNode} right - The right operand of the comparison.
     */
    constructor(left, operator, right) {
        super("CompareNode");
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    /**
     * Parses a CompareNode from JSON.
     * @param {Object} json - The JSON representation of the comparison node.
     * @param {String} code - The Python code to parse.
     * @returns {CompareNode} The parsed CompareNode.
     */
    static parse(json, code) {
        const operators = {
            Eq: "==",
            NotEq: "!=",
            Lt: "<",
            LtE: "<=",
            Gt: ">",
            GtE: ">=",
        };

        const left = parseNode(json.fields.left, code);
        const operator = operators[json.fields.ops[0].type];
        const right = parseNode(json.fields.comparators[0], code);
        return new CompareNode(left, operator, right);
    }
}

/**
 * Node that represents an augmented assignment in the Python AST.
 * @extends ASTNode
 */
export class AugAssignNode extends ASTNode {
    /**
     * Creates an instance of AugAssignNode.
     * @param {ASTNode} target - The target of the assignment.
     * @param {string} operator - The assignment operator.
     * @param {ASTNode} value - The value to assign.
     */
    constructor(target, operator, value) {
        super("AugAssignNode");
        this.target = target;
        this.operator = operator;
        this.value = value;
    }

    /**
     * Parses an AugAssignNode from JSON.
     * @param {Object} json - The JSON representation of the augmented assignment node.
     * @param {String} code - The Python code to parse.
     * @returns {AugAssignNode} The parsed AugAssignNode.
     */
    static parse(json, code) {
        const operators = {
            Add: "+=",
            Sub: "-=",
            Mult: "*=",
            Div: "/=",
            FloorDiv: "//=",
            Mod: "%=",
            Pow: "**=",
            LShift: "<<=",
            RShift: ">>=",
            BitOr: "|=",
            BitXor: "^=",
            BitAnd: "&=",
            MatMult: "@=",
        };

        const target = parseNode(json.fields.target, code);
        const operator = operators[json.fields.op.type];
        const value = parseNode(json.fields.value, code);
        return new AugAssignNode(target, operator, value);
    }
}

/**
 * Node that represents an import statement in the Python AST.
 * @extends ASTNode
 */
export class ImportNode extends ASTNode {
    /**
     * Creates an instance of ImportNode.
     * @param {string} pImport - The name of the module being imported.
     * @param {string} from - The name of the module being imported from, if applicable.
     */
    constructor(pImport, from) {
        super("ImportNode");
        this.import = pImport;
        this.from = from;
    }

    /**
     * Parses an ImportNode from JSON.
     * @param {Object} json - The JSON representation of the import node.
     * @param {String} code - The Python code to parse.
     * @returns {ImportNode} The parsed ImportNode.
     */
    static parse(json, code) {
        if (json.type === "Import") {
            const pImport = json.fields.names[0].fields.name;
            return new ImportNode(pImport, null);
        } else {
            const pImport = json.fields.names[0].fields.name;
            const from = json.fields.module;
            return new ImportNode(pImport, from);
        }
    }
}

/**
 * Node that represents a joined string in the Python AST.
 * @extends ASTNode
 */
export class JoinedStrNode extends ASTNode {
    /**
     * Creates an instance of JoinedStrNode.
     * @param {ASTNode[]} values - The values of the joined string.
     */
    constructor(values) {
        super("JoinedStrNode");
        this.values = values;
    }

    /**
     * Parses a JoinedStrNode from JSON.
     * @param {Object} json - The JSON representation of the joined string node.
     * @param {String} code - The Python code to parse.
     * @returns {JoinedStrNode} The parsed JoinedStrNode.
     */
    static parse(json, code) {
        // DAMN U, PYODIDE!
        // Again... Pyodide can't parse JoinedStr nodes correctly, so we have to do it manually
        // This is a workaround until the issue is fixed.
        // 
        // For example, the following code:
        //  print(f"Hello, {name}!")
        // We want to extract f"Hello, {name}!" as value
        const { lineno } = json;
        
        const line = code.split("\n")[lineno - 1];
        const start = line.indexOf('f"');
        const end = line.lastIndexOf('"') + 1;
        const value = line.substring(start, end);

        return new ConstantNode(value);
    }
}