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
import { findAllBasicExpressions } from './limboole-utils.js';
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
        
        findAllBasicExpressions(document.parseResult.value);
    }
});