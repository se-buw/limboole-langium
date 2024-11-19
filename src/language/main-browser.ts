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


declare const self: DedicatedWorkerGlobalScope;

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);

const { shared, Limboole } = createLimbooleServices({ connection, ...EmptyFileSystem });

startLanguageServer(shared);