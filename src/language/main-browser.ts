import { EmptyFileSystem, DocumentState} from 'langium';
import { startLanguageServer } from 'langium/lsp';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    Diagnostic,
    NotificationType,
    createConnection
} from 'vscode-languageserver/browser.js';
import { createLimbooleServices } from './limboole-module.js';
import { Expr } from './generated/ast.js';

declare const self: DedicatedWorkerGlobalScope;

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

const { shared, Limboole } = createLimbooleServices({ connection, ...EmptyFileSystem });

startLanguageServer(shared);

// Send a notification with the serialized AST after every document change
type DocumentChange = { uri: string, content: string, diagnostics: Diagnostic[] };
const documentChangeNotification = new NotificationType<DocumentChange>('browser/DocumentChange');
// use the built-in AST serializer
const jsonSerializer = Limboole.serializer.JsonSerializer;

//Listen on parsed documents
shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Parsed, documents => {
    // perform this for every validated document in this build phase batch
   for (const document of documents) {
        const json = jsonSerializer.serialize(document.parseResult.value);
        
        var exprs = findAllBasicExpressions(document.parseResult.value);
        
        // connection.sendNotification(documentChangeNotification, {
        //     uri: document.uri.toString(),
        //     content: json,
        //     diagnostics: document.diagnostics ?? []
        // });
    }
});


// MOVE THIS TO A SEPARATE FILE
function findAllBasicExpressions(rootNode: any): any[] {
    const expressions: any[] = traverseAndAddNodeWithStack(rootNode);

    console.log("Expressions: ");
    expressions.forEach(e => {
        console.log(e);
    });


    if (expressions.length > 2) {
        console.log(`Levenshtein Distance between "${expressions[1]}" and "${expressions[2]}":`, levenshteinDistance(expressions[1], expressions[2]));
    }

    return expressions;
}

function conditionToAddNode(node: any): boolean {
    return node.var !== undefined;
}

function addNodeIfCondition(node: any): void {
    if (conditionToAddNode(node)) {
        return node.var
    }
}

function traverseAndAddNodeWithStack(root: any,): any[] {
    if (root === null) return [];

    const expressions: any[] = [];

    // Initialize the stack with the root node
    const stack: any[] = [root];

    while (stack.length > 0) {
        // Pop the last node from the stack for depth-first traversal
        const currentNode = stack.pop() as any;

        // Add a new node if the condition is met
        expressions.push(addNodeIfCondition(currentNode));

        // Push the right and left children onto the stack if they exist
        if (currentNode.right) stack.push(currentNode.right);
        if (currentNode.left) stack.push(currentNode.left);
    }

    return expressions
}

function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // Initialize a matrix of size (len1 + 1) x (len2 + 1)
    const matrix = Array.from(Array(len1 + 1), () => Array(len2 + 1).fill(0));

    // Set up the base cases
    for (let i = 0; i <= len1; i++) {
        matrix[i][0] = i; // Deletion cost
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j; // Insertion cost
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                // No cost if characters are the same
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                // Take the minimum of insertion, deletion, or substitution
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // Deletion
                    matrix[i][j - 1] + 1, // Insertion
                    matrix[i - 1][j - 1] + 1 // Substitution
                );
            }
        }
    }

    // The Levenshtein Distance is in the bottom-right cell
    return matrix[len1][len2];
}


