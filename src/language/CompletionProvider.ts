// completion.ts or CompletionProvider.ts
import { LangiumCompletionParser, LangiumDocument, LangiumCoreServices, MaybePromise } from 'langium';
import { CancellationToken, CompletionItem, CompletionItemKind, CompletionList, CompletionParams, Position } from 'vscode-languageserver';
import { expressionCollection } from './limboole-utils.js';
import { CompletionProvider, CompletionProviderOptions } from 'langium/lsp';
import { LimbooleServices } from './limboole-module.js';
import { Expr, isExpr } from './generated/ast.js';



export class LimbooleCompletionProvider implements CompletionProvider {
    
    
    
    constructor(services: LimbooleServices){
    }

    getCompletion(document: LangiumDocument, params: CompletionParams, cancelToken?: CancellationToken): MaybePromise<CompletionList | undefined> {
       

        const items = this.provideCompletionItems(document,  params.position);
        
        return CompletionList.create(items, true);
    }
    
    completionOptions?: CompletionProviderOptions | undefined;
    

    provideCompletionItems(document: LangiumDocument, position: Position): CompletionItem[] {

        const currentInput = this.getCurrentInput(document, position);
        const currentNodeInfo = this.getNodeAtPosition(currentInput, position);
        

        if (currentNodeInfo == undefined) return [];

        if (this.isAtVariablePosition(currentNodeInfo.Node)) {
            
            return this.getMatchingVariables(currentNodeInfo);
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

    private getMatchingVariables(nodeInfo: NodeInfo): CompletionItem[] {

        const input = nodeInfo.Node!.var;
        const variableNames = Object.keys(expressionCollection.getCollection());
        
        // TODO: implement fuzzy search
        // Make sure code completion doesnt show the current input if no other occurence exists
        const matches = variableNames.filter(varName => 
            varName.toLowerCase().includes(input.toLowerCase()) && 
            (varName.toLowerCase() !== input.toLowerCase() || nodeInfo.Occurences > 1)
        );
        
        
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
        return isExpr(node);
    }

    private getNodeAtPosition(input: string, position: Position) : NodeInfo | undefined {
        return this.findNodeAtPosition(input, position);
    }

    private findNodeAtPosition(input : string, position: Position): NodeInfo | undefined {
        const nodes = expressionCollection.getCollection()[input];

        var nodeAtPosition : NodeInfo = {Node: undefined, Occurences: 0};

        if (nodes == undefined) return nodeAtPosition;

        nodes.forEach((node) => {
            
            nodeAtPosition.Occurences = nodeAtPosition.Occurences + 1; 
            // Accept node relative to cursor
            if(node.$cstNode?.offset === (position.character - input.length)){
                nodeAtPosition.Node = node;
            }
        });

        console.log(nodeAtPosition)

        return  nodeAtPosition;
    }

}

interface NodeInfo{    
    Node: Expr | undefined;
    Occurences: number;
}