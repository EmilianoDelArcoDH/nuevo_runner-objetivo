/**
 * Base class for all AST nodes.
 */
export class ASTNode {
    /**
     * Creates an instance of ASTNode.
     * @param {string} type - The type of the node.
     * @param {Number} lineno - The line number where the node is defined.
     * @param {Number} col_offset - The column offset where the node is defined.
     */
    constructor(type, lineno, col_offset) {
        this.type = type; // The type of node
        this.lineno = lineno; // The line number where the node is defined
        this.col_offset = col_offset; // The column offset where the node is defined
    }
}

