import { AstNode } from 'langium';
import { Expr } from './generated/ast.js'; // Ensure you import your AST types

// Class to manage the collection of expressions and their corresponding nodes
class ExpressionCollection {
    findAllBasicExpressions(value: AstNode) {
        throw new Error('Method not implemented.');
    }
    clear() {
        throw new Error('Method not implemented.');
    }
    private expressionMap: { [key: string]: Expr[] };

    constructor() {
        this.expressionMap = {};
    }

    // Add a node corresponding to an expression to the map
    addToCollection(expression: string, node: Expr): void {
        if (this.expressionMap[expression]) {
            this.expressionMap[expression].push(node);
        } else {
            this.expressionMap[expression] = [node];
        }
    }

    // Reset the expression collection
    resetCollection(): void {
        this.expressionMap = {};
    }

    // Get the entire collection of expressions and nodes  *****
    getCollection(): { [key: string]: Expr[] } {
        return this.expressionMap;
    }

    // Get a list of all variable names (expressions)
    getVariablesList(): string[] {
        return Object.keys(this.expressionMap);
    }
}

// Export an instance of the collection for global access
export const expressionCollection = new ExpressionCollection();

// Function to traverse AST and extract variables
export function findAllBasicExpressions(rootNode: any): string[] {
    expressionCollection.resetCollection(); // Reset collection before starting
    traverseWithStack(rootNode); // Traverse the AST
    return expressionCollection.getVariablesList(); // Return the list of variables
}

// Depth-First Search (DFS) using stack for traversing the AST
function traverseWithStack(root: any): void {
    const stack: any[] = [root];

    while (stack.length > 0) {
        const currentNode = stack.pop() as any;

        // Add node if it contains a 'var' property (variable)
        addNodeIfCondition(currentNode);

        // Traverse the left and right child nodes if they exist
        if (currentNode.right) stack.push(currentNode.right);
        if (currentNode.left) stack.push(currentNode.left);
    }
}

// Check if the current node contains a 'var' property (indicating a variable)
function addNodeIfCondition(node: any): void {
    if (node.var !== undefined) {
        expressionCollection.addToCollection(node.var, node);
    }
}
