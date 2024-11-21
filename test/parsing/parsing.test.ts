import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import { createLimbooleServices } from "../../src/language/limboole-module.js";
import { Expr, And, Iff, Implies, Or, isExpr, isAnd, isIff, isImplies, isOr } from "../../src/language/generated/ast.js"; // Import the AST types

let services: ReturnType<typeof createLimbooleServices>;
let parse: ReturnType<typeof parseHelper<Expr>>; // Parsing an Expr type
let document: LangiumDocument<Expr> | undefined;

beforeAll(async () => {
    services = createLimbooleServices(EmptyFileSystem);
    parse = parseHelper<Expr>(services.Limboole);

    // Uncomment this if you need to initialize the workspace or add any libraries
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    // Test for parsing simple conjunction (AND)
    test('parse simple expression', async () => {
        document = await parse(`
            VAR x & VAR y
        `);

        expect(
            checkDocumentValid(document) || s`
                Expression:
                  ${document?.parseResult.value?.$type} 
                Variables:
                  ${document?.parseResult.value?.var}
            `
        ).toBe(s`
            Expression:
              And
            Variables:
              x
              y
        `);
    });

    // Test for parsing implication (IMPLIES)
    test('parse implication expression', async () => {
        document = await parse(`
            VAR x -> VAR y
        `);

        expect(
            checkDocumentValid(document) || s`
                Expression:
                  ${document?.parseResult.value?.$type} 
                Left Variable:
                  ${document?.parseResult.value?.left?.var}
                Right Variable:
                  ${document?.parseResult.value?.right?.var}
            `
        ).toBe(s`
            Expression:
              Implies
            Left Variable:
              x
            Right Variable:
              y
        `);
    });

    // Test for parsing a more complex expression (AND with IMPLIES)
    test('parse complex expression', async () => {
        document = await parse(`
            VAR x & (VAR y -> VAR z)
        `);

        expect(
            checkDocumentValid(document) || s`
                Expression:
                  ${document?.parseResult.value?.$type}
                Left Variable:
                  ${document?.parseResult.value?.left?.var}
                Right Expression:
                  ${document?.parseResult.value?.right?.$type}
                Right Left Variable:
                  ${document?.parseResult.value?.right?.left?.var}
                Right Right Variable:
                  ${document?.parseResult.value?.right?.right?.var}
            `
        ).toBe(s`
            Expression:
              And
            Left Variable:
              x
            Right Expression:
              Implies
            Right Left Variable:
              y
            Right Right Variable:
              z
        `);
    });

    // Test for parsing biconditional (IFF) expression
    test('parse biconditional expression', async () => {
        document = await parse(`
            VAR x <-> VAR y
        `);

        expect(
            checkDocumentValid(document) || s`
                Expression:
                  ${document?.parseResult.value?.$type}
                Left Variable:
                  ${document?.parseResult.value?.left?.var}
                Right Variable:
                  ${document?.parseResult.value?.right?.var}
            `
        ).toBe(s`
            Expression:
              Iff
            Left Variable:
              x
            Right Variable:
              y
        `);
    });
});

function checkDocumentValid(document: LangiumDocument<Expr>): string | undefined {
    if (!document.parseResult.value) {
        return `ParseResult is 'undefined'.`;
    }

    // Ensuring correct type inference
    const value = document.parseResult.value;

    // Use the type guards to check which concrete type the expression is
    if (isAnd(value)) {
        return undefined; // No error for And
    }
    if (isOr(value)) {
        return undefined; // No error for Or
    }
    if (isImplies(value)) {
        return undefined; // No error for Implies
    }
    if (isIff(value)) {
        return undefined; // No error for Iff
    }

    // Return error if none of the type guards matched
    return `Unknown expression type: ${value.$type}`;
}
