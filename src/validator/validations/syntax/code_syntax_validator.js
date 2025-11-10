import { ASTExtractor, parseAST } from "../../pyast/pyast.js";
import { CodeSyntaxValidationStory } from "./code_syntax_validator_story.js";

/**
 * Class responsible for validating Python code and checking if the syntax
 * structure satisfies the requirements of a given group of assertions.
 * 
 * This class does not perform any simulation or execution of the code,
 * it only checks the syntax structure. For example, it can check if a
 * function is defined, but it does not check the result of the function call.
 */
export class CodeSyntaxValidator {
    /**
     * Initializes a new instance of the CodeSyntaxValidator class.
     * @param {string} code - The Python code to validate.
     */
    constructor(code) {
        this.code = code;

        // Initialize the AST extractor, which will be used to extract the AST from 
        // the code and obtain the module.
        this.astExtractor = new ASTExtractor();

        // Initialize the module, which will contain the AST of the code.
        this.module = null;
    }

    /**
     * Validates the syntax of the provided Python code.
     * @throws {PythonSyntaxError} Throws a PythonSyntaxError if the syntax is invalid.
     */
    async validateSyntax() {
        // Extract the AST from the code.
        const result = await this.astExtractor.extractAST(this.code);
        if (!result.success) {
            throw result.error;
        }

        // Store the module for later use.
        this.module = parseAST(result.ast, this.code);
        return
    }

    theseStories(lang, ...stories) {
        // Store the errors from each story, grouped by story name.
        const storyErrors = {};

        // Iterate through each story and validate the assertions.
        stories.forEach(story => {
            const storyName = story.description;
            const storyAssertionFunc = story.test;

            // Create a new story instance.
            const storyInstance = new CodeSyntaxValidationStory(this, storyName);

            // Execute the assertion function.
            const errors = storyInstance.assert(storyAssertionFunc);

            // Store the errors in the storyErrors object, using the story name as the key.
            // If it has a translation, use the translated message.
            for (let i = 0; i < errors.length; i++) {
                const error = errors[i];
                
                // Check if the error has a translation for the given language.
                // If it has, use the translated message.
                if (error.translatedMessages && error.translatedMessages[lang]) {
                    errors[i] = error.translatedMessages[lang];
                }
            }

            storyErrors[storyName] = errors;
        });

        // Return the errors from all stories, grouped by story name.
        return storyErrors;
    }
}
