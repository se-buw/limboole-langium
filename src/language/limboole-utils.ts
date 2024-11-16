import { Expr } from "./generated/ast.js";

// todo: save map with all expressions and their corresponding nodes?
class ExpressionCollection{

    expressionMap: {[key: string]: Expr[]};

    constructor(){
        this.expressionMap = {};
    }

    addToCollection(expression: string, node: Expr): void {

        // We first need to create a new entry in the map if it doesn't exist
        if (this.expressionMap[expression]) {
            this.expressionMap[expression].push(node);
        } else {
            this.expressionMap[expression] = [node] ;
        }
    }    

    resetCollection(): void {
        this.expressionMap = {};
    }
    
    getCollection() {
        return this.expressionMap;
    }

    printCollection(): void {
        console.log("Printing all expressions in the collection:");
        for (const expression in this.expressionMap) {
            console.log(expression);
        }
    } 
}

export const expressionCollection = new ExpressionCollection();

export function findAllBasicExpressions(rootNode: any): void {

    expressionCollection.resetCollection();
    traverseWithStack(rootNode);
    expressionCollection.printCollection();
}

function traverseWithStack(root: any) {
    // Initialize the stack with the root node
    const stack: any[] = [root];

    while (stack.length > 0) {
        // Pop the last node from the stack for depth-first traversal
        const currentNode = stack.pop() as any;

        // Add a new node if the condition is met
        addNodeIfCondition(currentNode);

        // Push the right and left children onto the stack if they exist
        if (currentNode.right) stack.push(currentNode.right);
        if (currentNode.left) stack.push(currentNode.left);
    }
}

function addNodeIfCondition(node: any): void {
    if (node.var !== undefined) {
        expressionCollection.addToCollection(node.var, node);
    }
}



