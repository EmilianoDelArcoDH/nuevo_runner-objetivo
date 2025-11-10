
/**
 * Represents a Python syntax error with details about where it occurred.
 */
class PythonSyntaxError extends Error {
    /**
     * @param {string} message - The error message.
     * @param {number} lineno - The line number where the error occurred.
     * @param {number} offset - The column number where the error occurred.
     */
    constructor(message, lineno, offset) {
        super(message);
        this.name = "PythonSyntaxError";
        this.lineno = lineno;
        this.offset = offset;
    }

    toString() {
        return `${this.name}: ${this.message} at line ${this.lineno}, column ${this.offset}`;
    }
}

/**
 * Class responsible for validating Python code syntax and extracting the AST.
 */
class ASTExtractor {
    constructor() {
        this.pyodideReadyPromise = this.loadPyodide();
    }

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
     * Validates Python syntax and extracts the AST from the given code.
     * @param {string} code - The Python code to validate and parse.
     * @returns {Promise<Object>} Result object indicating success or error.
     * - success: Boolean indicating if the operation was successful.
     * - ast: The AST if the syntax is valid.
     * - error: Instance of PythonSyntaxError if there was a syntax error.
     */
    async extractAST(code) {
        await this.pyodideReadyPromise;

        const validationAndASTCode = `
import ast
import json

def ast_to_dict(node):
    if isinstance(node, ast.AST):
        return {
            'type': type(node).__name__,
            'fields': {field: ast_to_dict(getattr(node, field)) for field in node._fields},
            'lineno': getattr(node, 'lineno', None),
            'col_offset': getattr(node, 'col_offset', None)
        }
    elif isinstance(node, list):
        return [ast_to_dict(x) for x in node]
    else:
        return node

def validate_and_extract_ast(code):
    try:
        ast_tree = ast.parse(code)
        ast_dict = ast_to_dict(ast_tree)
        return {"success": True, "ast": ast_dict, "error": None}
    except SyntaxError as e:
        return {
            "success": False, 
            "ast": None, 
            "error": {
                "message": str(e),
                "lineno": e.lineno,
                "offset": e.offset if e.offset is not None else -1
            }
        }

validate_and_extract_ast("""${code}""")
        `;

        const jsResult = this.pyodide.runPython(validationAndASTCode).toJs();

        if (jsResult.success) {
            return { success: true, ast: jsResult.ast };
        }

        const errorDetails = jsResult.error;
        throw new PythonSyntaxError(errorDetails.message, errorDetails.lineno, errorDetails.offset);
    }
}

export { PythonSyntaxError, ASTExtractor };
