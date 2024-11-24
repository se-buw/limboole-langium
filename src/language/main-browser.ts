import { EmptyFileSystem, DocumentState } from 'langium';
import { startLanguageServer } from 'langium/lsp';
import {
    BrowserMessageReader,
    BrowserMessageWriter,
    Diagnostic,
    NotificationType,
    createConnection
} from 'vscode-languageserver/browser.js';
import { createLimbooleServices } from './limboole-module.js';
import { findAllBasicExpressions, expressionCollection } from './limboole-utils.js';
import { CompletionItem, CompletionItemKind, Position } from 'vscode-languageserver';

declare const self: DedicatedWorkerGlobalScope;

// Initialize the message reader and writer for browser communication
const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

// Create the connection to the language server
const connection = createConnection(messageReader, messageWriter);

// Create the Limboole language services
const { shared, Limboole } = createLimbooleServices({ connection, ...EmptyFileSystem });

// Start the language server
startLanguageServer(shared);

// Type definition for Document Change notification
type DocumentChange = { 
    uri: string; 
    content: string; 
    diagnostics: Diagnostic[]; 
    variables: string[]; 
};

// Define the notification type for document changes
const documentChangeNotification = new NotificationType<DocumentChange>('browser/DocumentChange');

// Use the built-in AST serializer provided by Limboole language services
const jsonSerializer = Limboole.serializer.JsonSerializer;

// Listen for parsed documents after each build phase
shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.Parsed, (documents) => {
    for (const document of documents) {
        // Serialize the parsed AST into JSON format (optional, for debugging)
        const json = jsonSerializer.serialize(document.parseResult.value);

        // Extract variables and populate the expressionCollection
        findAllBasicExpressions(document.parseResult.value);

        // Access the list of variables
        const variablesList = expressionCollection.getVariablesList();
        // console.log('Extracted variables list:', variablesList);

        // Send the variables as a notification
        connection.sendNotification(documentChangeNotification, {
            uri: document.textDocument.uri, // Ensure correct document URI
            content: document.textDocument.getText(), // Ensure correct content
            diagnostics: [], // Add diagnostics if available
            variables: variablesList // List of extracted variables
        });
    }
});

