export class ASTTransverser {
    traverseAST(node, nodes, nodeType) {
        if (!node || typeof node !== 'object') return;

        // If we find a node of the specified type, add it to the list
        if (node.type === nodeType) {
            nodes.push(node);
        }

        // Traverse the node fields
        for (const [, value] of Object.entries(node.fields)) {
            if (Array.isArray(value)) {
                value.forEach(childNode => this.traverseAST(childNode, nodes, nodeType)); // Recursion for arrays
            } else {
                this.traverseAST(value, nodes, nodeType); // Recursion for individual nodes
            }
        }
    }
}