import { describe, expect, test } from "vitest";
import { EmptyFileSystem } from "langium";
import { createLimbooleServices } from "../../src/language/limboole-module.js";
import { parseDocument } from 'langium/test';

import * as fs from 'fs';
import * as path from 'path';

const services = createLimbooleServices(EmptyFileSystem).Limboole;
const resourceDir = path.resolve(__dirname, '../resources/limboole');
const logFilePath = path.resolve(__dirname, '../resources/test-results.log');


describe('Validating Typo Check', () => {
    /*
        * The test case is to validate the typo check for the expression "kitten & kiten".
        * The expected result is to detect a possible typo between "kitten" and "kiten". 
    **/
    test('Detects possible typo between kitten & kiten', async () => {
        try {
            await assertValidateSpelling(`
                kitten & kiten
            `);
        } catch (error) {
            throw error;
        }
    });
});

describe('Validating Typo Check in FMP Dataset', async () => {
    const testFiles = fs.readdirSync(resourceDir).filter(file => file.endsWith('.limboole'));
    for (const file of testFiles) {
        test(`Detects possible typo in ${file}`, async () => {
            try {
                const filePath = path.resolve(resourceDir, file);
                const limbooleModel = fs.readFileSync(filePath, 'utf-8');
                await assertValidateSpelling(limbooleModel);
                // logToFile(`✅Test passed: Detects possible typo in ${filePath}`);
            } catch (error) {
                throw error;
            }
        });
    }
});



/**
 * Check if there is a possible typo in the given model text.
 * If there is a possible typo, there should be a diagnostic with the code 'typo' and diagnostic length should be greater than 0.
 * @param modelText 
 */
async function assertValidateSpelling(modelText: string): Promise<void> {
    const doc = await parseDocument(services, modelText);
    const db = services.shared.workspace.DocumentBuilder;
    await db.build([doc], { validation: true });
    const diagnostics = doc.diagnostics ?? [];
    expect(diagnostics.length).toBeGreaterThan(0);
    const typoDiagnostic = diagnostics.find(d => d.code === 'typo');
    expect(typoDiagnostic?.message).toContain("A possible typo was detected. Do you mean:");
}


function logToFile(message: string) {
    fs.appendFileSync(logFilePath, message + '\n');
}