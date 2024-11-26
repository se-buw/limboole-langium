import { LangiumCompletionParser, LangiumDocument, LangiumCoreServices, MaybePromise } from 'langium';
import { CancellationToken, CompletionItem, CompletionItemKind, CompletionList, CompletionParams, Position } from 'vscode-languageserver';
import { expressionCollection } from './limboole-utils.js';
import { CompletionProvider, CompletionProviderOptions } from 'langium/lsp';
import { LimbooleServices } from './limboole-module.js';
import { Expr, isExpr } from './generated/ast.js';

// Defines the completion provider class for the Limboole language.
export class LimbooleCompletionProvider implements CompletionProvider {

    // Constructor accepting Limboole-specific services.
    constructor(services: LimbooleServices) {}

    // Main entry point for code completion requests. Returns a list of completion items.
    getCompletion(document: LangiumDocument, params: CompletionParams, cancelToken?: CancellationToken): MaybePromise<CompletionList | undefined> {
        // Retrieve completion items based on the document and cursor position.
        const items = this.provideCompletionItems(document, params.position);
        
        // Return the completion items as a CompletionList.
        return CompletionList.create(items, true);
    }
    
    // Optional configuration for the completion provider (can be customized if needed).
    completionOptions?: CompletionProviderOptions | undefined;

    // Generates completion items based on the current cursor position in the document.
    provideCompletionItems(document: LangiumDocument, position: Position): CompletionItem[] {
        // Extract the current input string from the document at the given position.
        const currentInput = this.getCurrentInput(document, position);

        // Get the AST node information at the cursor position.
        const currentNodeInfo = this.getNodeAtPosition(currentInput, position);

        // Check if currentNodeInfo is undefined or if no valid node is found, return an empty list.
        if (!currentNodeInfo || !currentNodeInfo.Node) {
            return [];
        }

        // Check if the cursor is at a position where variables can be suggested.
        if (this.isAtVariablePosition(currentNodeInfo.Node)) {
            // Generate a list of matching variable completion items.
            return this.getMatchingVariables(currentNodeInfo);
        }

        // Add additional completion cases as needed
        // Example: Function completion, keyword completion
        if (this.isAtFunctionPosition(currentNodeInfo.Node)) {
            return this.getMatchingFunctions(currentNodeInfo);
        }

        if (this.isAtKeywordPosition(currentNodeInfo.Node)) {
            return this.getMatchingKeywords(currentNodeInfo);
        }

        // Default to an empty list if no specific suggestions are applicable.
        return [];
    }
    getMatchingKeywords(currentNodeInfo: NodeInfo): CompletionItem[] {
        throw new Error('Method not implemented.');
    }
    getMatchingFunctions(currentNodeInfo: NodeInfo): CompletionItem[] {
        throw new Error('Method not implemented.');
    }

    // Extracts the current input string up to the cursor position for matching.
    private getCurrentInput(document: LangiumDocument, position: Position): string {
        const text = document.textDocument.getText(); // Full document text.
        const offset = document.textDocument.offsetAt(position); // Cursor position offset.
        const inputFragment = text.slice(0, offset); // Text up to the cursor.
        const match = inputFragment.match(/[a-zA-Z0-9_]+$/); // Match valid variable names.
        return match ? match[0] : ''; // Return the matched string or an empty string.
    }

    // Retrieves a list of completion items for matching variable names.
    private getMatchingVariables(nodeInfo: NodeInfo): CompletionItem[] {
        const input = nodeInfo.Node!.var; // Current input string.
        const variableNames = Object.keys(expressionCollection.getCollection()); // All variable names.

        // Filter variables based on a fuzzy search condition.
        const matches = variableNames.filter(varName => 
            varName.toLowerCase().includes(input.toLowerCase()) && 
            (varName.toLowerCase() !== input.toLowerCase() || nodeInfo.Occurrences > 1)
        );

        // Convert matches into CompletionItem objects for display in the editor.
        return matches.map(varName => ({
            label: varName, // The variable name to display.
            kind: CompletionItemKind.Variable, // Mark this as a variable kind.
            insertText: varName, // Text to insert when selected.
            detail: `Variable: ${varName}`, // Additional detail about the variable.
            documentation: { // Documentation for the variable (optional).
                kind: 'markdown',
                value: `**Variable Name:** \`${varName}\`\nThis matches your input: \`${input}\`.`
            }
        }));
    }

    // Checks whether the current AST node represents a valid position for variable completion.
    private isAtVariablePosition(node: any): boolean {
        return isExpr(node); // Uses a type guard to check if the node is an expression.
    }

    // Checks whether the current AST node represents a valid position for function completion (stub).
    private isAtFunctionPosition(node: any): boolean {
        // Implement logic for checking if the node represents a function position.
        return false;
    }

    // Checks whether the current AST node represents a valid position for keyword completion (stub).
    private isAtKeywordPosition(node: any): boolean {
        // Implement logic for checking if the node represents a keyword position.
        return false;
    }

    // Finds the AST node at the current position and returns related information.
    private getNodeAtPosition(input: string, position: Position): NodeInfo | undefined {
        return this.findNodeAtPosition(input, position);
    }

    // Searches the AST for a node at the specified position, relative to the current input.
    private findNodeAtPosition(input: string, position: Position): NodeInfo | undefined {
        const nodes = expressionCollection.getCollection()[input]; // Get nodes matching the input.

        // Initialize node information structure.
        var nodeAtPosition: NodeInfo = { Node: undefined, Occurrences: 0 };

        if (nodes == undefined) return nodeAtPosition; // Return if no nodes are found.

        // Iterate through matching nodes to find the one at the current cursor position.
        nodes.forEach((node) => {
            nodeAtPosition.Occurrences = nodeAtPosition.Occurrences + 1; // Count occurrences.
            
            // Accept node if its position matches the cursor position.
            if (node.$cstNode?.offset === (position.character - input.length)) {
                nodeAtPosition.Node = node;
            }
        });

        return nodeAtPosition; // Return the identified node information.
    }
}

// Interface representing information about a node and its occurrences.
interface NodeInfo {    
    Node: Expr | undefined; // The AST node.
    Occurrences: number; // Count of occurrences of the node.
}
