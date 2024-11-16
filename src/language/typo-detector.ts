import exp from "constants";
import { expressionCollection } from "./limboole-utils.js";


/** 
 * Test an expressions against all expressions in the document. 
 * @param exprStr Current expression to be tested
 * @returns Proposal of an expression name in the document, that could be the intended spelling. 
*/
export function checkTypo(exprStr: string): string | undefined {
    
    const expressionMap = expressionCollection.getCollection();


    if(expressionMap[exprStr].length >= 2 || exprStr.length < 3) return undefined;

    for(const key in expressionMap) {
        
        // if current expression more occurence than the other expression tested, we skip it
        if(!(expressionMap[exprStr].length > expressionMap[key].length )) {
            const distance = levenshteinDistance(exprStr, key);

            // rules shouldnt be too strict
            if (distance < 2 && distance !== 0) {
                console.log(`Typo detected: ${exprStr} is similar to ${key}`);
                return key;
            }
        }
    }

    return undefined
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


