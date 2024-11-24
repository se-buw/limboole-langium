import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { LimbooleAstType, Expr, And, Or, Implies, Iff } from './generated/ast.js';
import { isAnd, isOr, isIff, isImplies } from './generated/ast.js';
import type { LimbooleServices } from './limboole-module.js';


/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: LimbooleServices): void {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.LimbooleValidator;

    const checks: ValidationChecks<LimbooleAstType> = {
        Expr: [
            (node: Expr, accept: ValidationAcceptor) => validator.checkPersonStartsWithNot(node as Expr, accept),
            (node: Expr, accept: ValidationAcceptor) => validator.operatorShouldBeBetweenOperands(node as Expr, accept)
        ]
    };

    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class LimbooleValidator {
    /**
     * Check if an operator (e.g., AND, OR, etc.) has both left and right operands.
     */
    operatorShouldBeBetweenOperands(expr: Expr, accept: ValidationAcceptor): void {
        if (isAnd(expr) || isOr(expr) || isIff(expr) || isImplies(expr)) {
            validateBinaryOperands(expr, accept, expr.$type);
        }
    }

    /**
     * Check if variable names start with a '!' character and warn against it.
     */
    checkPersonStartsWithNot(expr: Expr, accept: ValidationAcceptor): void {
        if (expr.var && expr.var.startsWith('!')) {
            accept('warning', 'Variable name should not start with "!"', {
                node: expr,
                property: 'var'
            });
        }
    }
}

/**
 * Validate binary operators to ensure they have both left and right operands.
 */
function validateBinaryOperands(
    expr: And | Or | Iff | Implies,
    accept: ValidationAcceptor,
    operatorName: string
): void {
    if (!expr.left) {
        accept('error', `Left operand is missing for the "${operatorName}" operator.`, {
            node: expr,
            property: 'left'
        });
    }
    if (!expr.right) {
        accept('error', `Right operand is missing for the "${operatorName}" operator.`, {
            node: expr,
            property: 'right'
        });
    }
    if (expr.left == expr.right) {
        accept('error', `Left and Right operand are the same for the  "${operatorName}" operator.`, {
            node: expr,
            property: 'right'
        });
    
}
