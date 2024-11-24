// completion.ts or CompletionProvider.ts
import { LangiumCompletionParser, LangiumDocument, LangiumCoreServices } from 'langium';
import { CompletionItem, CompletionItemKind, Position } from 'vscode-languageserver';
import { expressionCollection } from './limboole-utils.js';

export class LimbooleCompletionProvider extends LangiumCompletionParser {
    constructor(services: LangiumCoreServices) {
        super(services);
    }

    async provideCompletionItems(document: LangiumDocument, position: Position): Promise<CompletionItem[]> {
        const currentNode = this.getNodeAtPosition(document, position);

        if (this.isAtVariablePosition(currentNode)) {
            const input = this.getCurrentInput(document, position);
            return this.getMatchingVariables(input);
        }

        return [];
    }

    private getCurrentInput(document: LangiumDocument, position: Position): string {
        const text = document.textDocument.getText();
        const offset = document.textDocument.offsetAt(position);
        const inputFragment = text.slice(0, offset);
        const match = inputFragment.match(/[a-zA-Z0-9_]+$/);
        return match ? match[0] : '';
    }

    private getMatchingVariables(input: string): CompletionItem[] {
        const variableNames = Object.keys(expressionCollection.getCollection());
        const matches = variableNames.filter(varName => varName.toLowerCase().includes(input.toLowerCase()));
        
        return matches.map(varName => ({
            label: varName,
            kind: CompletionItemKind.Variable,
            insertText: varName,
            detail: `Variable: ${varName}`,
            documentation: {
                kind: 'markdown',
                value: `**Variable Name:** \`${varName}\`\nThis matches your input: \`${input}\`.`
            }
        }));
    }

    private isAtVariablePosition(node: any): boolean {
        return node && node.$type === 'Expr' && !node.var;
    }

    getNodeAtPosition(document: LangiumDocument, position: Position) {
        const rootNode = document.parseResult.value;
        return this.findNodeAtPosition(rootNode, position);
    }

    findNodeAtPosition(rootNode: any, position: Position): any {
        const stack = [rootNode];
        while (stack.length > 0) {
            const currentNode = stack.pop() as any;
            if (this.isNodeAtPosition(currentNode, position)) {
                return currentNode;
            }
            if (currentNode.left) stack.push(currentNode.left);
            if (currentNode.right) stack.push(currentNode.right);
        }
        return null;
    }

    isNodeAtPosition(node: any, position: Position): boolean {
        return node.start <= position.line && node.end >= position.line;
    }
}
