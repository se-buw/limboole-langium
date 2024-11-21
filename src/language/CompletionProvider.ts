import { LangiumCompletionParser, LangiumDocument, LangiumCoreServices } from 'langium';
import { CompletionItem, CompletionItemKind, Position } from 'vscode-languageserver';
import { expressionCollection } from './limboole-utils.js';

export class LimbooleCompletionProvider extends LangiumCompletionParser {

    constructor(services: LangiumCoreServices) {
        super(services);
    }

    // Provide code completion items based on the current context
    async provideCompletionItems(document: LangiumDocument, position: Position): Promise<CompletionItem[]> {
        const currentNode = this.getNodeAtPosition(document, position);
        const completions: CompletionItem[] = [];

        // If we are at a position where a variable is expected, provide variable completions
        if (this.isAtVariablePosition(currentNode)) {
            completions.push(...this.getVariableCompletions());
        }

        return completions;
    }

    // Retrieve the node at the given position in the document
    getNodeAtPosition(document: LangiumDocument, position: Position) {
        // Access the AST from the document's parseResult
        const rootNode = document.parseResult.value;

        // Use a utility function to traverse the AST and find the node at the given position
        // You can create a utility function like `findNodeAtPosition` if needed
        return this.findNodeAtPosition(rootNode, position);
    }

    // Traverse the AST and find the node at the given position
    findNodeAtPosition(rootNode: any, position: Position): any {
        // Implement a recursive traversal or stack-based DFS to find the correct node at the position
        const stack = [rootNode];

        while (stack.length > 0) {
            const currentNode = stack.pop() as any;

            // Check if the current node contains the position
            if (this.isNodeAtPosition(currentNode, position)) {
                return currentNode;
            }

            // Traverse child nodes (if any)
            if (currentNode.left) stack.push(currentNode.left);
            if (currentNode.right) stack.push(currentNode.right);
        }
        return null; // Return null if no node was found at the position
    }

    // Check if a node is at the given position
    isNodeAtPosition(node: any, position: Position): boolean {
        // This is a placeholder for position matching logic
        // You need to adjust this to match the actual logic of your AST structure
        return node.start <= position.line && node.end >= position.line; // Example check
    }

    // Check if the node at the current position is a valid expression without a variable
    private isAtVariablePosition(node: any): boolean {
        return node && node.$type === 'Expr' && !node.var; // Example check, adapt as necessary
    }

    // Get variable completions based on the expressions stored in the collection
    private getVariableCompletions(): CompletionItem[] {
        // Retrieve all variables from the expression collection
        const variableNames = Object.keys(expressionCollection.getCollection());

        // Create completion items for each variable
        return variableNames.map(varName => ({
            label: varName,
            kind: CompletionItemKind.Variable,
            insertText: varName,  // The variable will be inserted as-is
            detail: `Variable: ${varName}`,
            documentation: `This is the variable: ${varName}`  // Add documentation for extra info
        }));
    }
}
