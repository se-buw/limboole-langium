import { CompletionAcceptor, CompletionContext, DefaultCompletionProvider, CompletionValueItem } from 'langium/lsp';
import { CompletionItemKind } from 'vscode-languageserver';
import { injectable } from 'tsyringe';

/**
 * LimbooleCompletionProvider - Custom completion provider for Limboole language.
 * It provides autocompletion suggestions based on previously entered user inputs.
 */
@injectable()
export class LimbooleCompletionProvider extends DefaultCompletionProvider {
    // Store user inputs for autocompletion suggestions
    private userInputs: Set<string> = new Set();

    /**
     * Provides completion suggestions based on the current word and user inputs.
     * @param context The completion context, which includes document and cursor information.
     * @param acceptor The completion acceptor used to pass back completion suggestions.
     */
    async provideCompletion(context: CompletionContext, acceptor: CompletionAcceptor): Promise<void> {
        const currentWord = this.getCurrentWord(context); // Get the word currently being typed

        // Iterate through stored user inputs and provide matching suggestions
        this.userInputs.forEach((input) => {
            if (input.toLowerCase().startsWith(currentWord.toLowerCase())) {
                const completionItem: CompletionValueItem = {
                    label: input,             // The label to display for the completion
                    kind: CompletionItemKind.Text,  // Kind of completion item (e.g., Text, Function, etc.)
                    insertText: input        // Text to insert upon selection
                };
                // Call acceptor with both the context and the completion item
                acceptor(context, completionItem);
            }
        });
    }

    /**
     * Adds a user input to the stored set of user inputs for future autocompletion.
     * @param input The user input to add.
     */
    addUserInput(input: string): void {
        if (input && input.trim() !== '') {
            this.userInputs.add(input.trim());
        }
    }

    /**
     * Retrieves the current word being typed at the cursor position.
     * @param context The completion context.
     * @returns The current word being typed.
     */
    private getCurrentWord(context: CompletionContext): string {
        const documentText = context.textDocument.getText(); // Get the entire text of the document
        const cursorOffset = context.offset;  // Get the cursor position (offset)
        let start = cursorOffset - 1;  // Start from the cursor position and move backward

        // Move backward to find the start of the current word
        while (start >= 0 && !/\s/.test(documentText[start])) {
            start--;
        }

        // Return the substring from the start of the word to the current cursor position
        return documentText.substring(start + 1, cursorOffset);
    }
}
