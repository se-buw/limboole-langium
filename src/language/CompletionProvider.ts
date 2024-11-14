import type { LimbooleServices } from './limboole-module.js';
import { CompletionItem, Position, CodeActionContext } from 'vscode-languageserver-types';
import { CompletionItemKind } from 'vscode-languageserver';

// Define a basic completion function
async function getCompletionItems(position: Position, context: CodeActionContext, services: LimbooleServices): Promise<CompletionItem[]> {
    return [
        // Logical operations as class types
        {
            label: 'And',// The visible label for the completion item, shown in the autocomplete dropdown.
            kind: CompletionItemKind.Class,  // Suggesting logical AND
            insertText: 'And',  // The text that will be inserted into the editor when the user selects this suggestion.s
            documentation: 'Logical AND operation.' //A description that appears as a tooltip, explaining what this item represents.
        },
        {
            label: 'Or',
            kind: CompletionItemKind.Class,  // Suggesting logical OR
            insertText: 'Or',
            documentation: 'Logical OR operation.'
        },
        {
            label: 'Implies',
            kind: CompletionItemKind.Class,  // Suggesting logical implication
            insertText: 'Implies',
            documentation: 'Logical implication.'
        },
        {
            label: 'Iff',
            kind: CompletionItemKind.Class,  // Suggesting logical "if and only if"
            insertText: 'Iff',
            documentation: 'Logical equivalence (if and only if).'
        },

        // Operators as keywords
        {
            label: '!',
            kind: CompletionItemKind.Keyword,  // Suggesting NOT operator
            insertText: '!',
            documentation: 'Logical NOT operator.'
        },
        {
            label: '&',
            kind: CompletionItemKind.Keyword,  // Suggesting AND operator
            insertText: '&',
            documentation: 'Logical AND operator.'
        },
        {
            label: '|',
            kind: CompletionItemKind.Keyword,  // Suggesting OR operator
            insertText: '|',
            documentation: 'Logical OR operator.'
        },
        {
            label: '->',
            kind: CompletionItemKind.Keyword,  // Suggesting implication operator
            insertText: '->',
            documentation: 'Implies operator.'
        },
        {
            label: '<->',
            kind: CompletionItemKind.Keyword,  // Suggesting equivalence operator
            insertText: '<->',
            documentation: 'If and only if operator.'
        },

        // Variable suggestion example
        {
            label: 'variableName',
            kind: CompletionItemKind.Variable,  // Variable completion type
            insertText: 'varName',
            documentation: 'A variable name suggestion.'
        },
        {
            label: 'VAR',
            kind: CompletionItemKind.Variable,
            insertText: 'VAR',
            documentation: 'Variable pattern according to Limboole syntax.'
        }
    ];
}

// CompletionProvider function
export const LimbooleCompletionProvider = {
    provideCompletionItems: (position: Position, context: CodeActionContext, services: LimbooleServices) => {
        return getCompletionItems(position, context, services);
    }
};
