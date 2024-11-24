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