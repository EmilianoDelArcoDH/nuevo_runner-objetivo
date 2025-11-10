import { ASTNode } from './src/ast_node.js';
import { ASTTransverser } from './src/ast_transverser.js';
import { 
    FunctionNode,
    FunctionArgumentNode,
    MethodNode,
    ClassNode,
    IfNode,
    ReturnNode,
    NameNode,
    ConstantNode,
    BinOpNode,
    CallNode,
    VariableAssignNode,
    AttributeNode,
    parseNode 
} from './src/definitions.js';
import { PythonSyntaxError, ASTExtractor } from './src/ast_extractor.js';

/**
 * Main parsing function to parse the entire AST.
 * @param {Object} ast - The JSON representation of the AST.
 * @param {String} code - The Python code.
 * @returns {ASTNode} The parsed ASTNode.
 */
export const parseAST = (ast, code) => parseNode(ast, code);

export {
    ASTNode,
    PythonSyntaxError,
    ASTExtractor,
    ASTTransverser,
    FunctionNode,
    FunctionArgumentNode,
    MethodNode,
    ClassNode,
    IfNode,
    ReturnNode,
    NameNode,
    ConstantNode,
    BinOpNode,
    CallNode,
    VariableAssignNode,
    AttributeNode,
    parseNode 
};