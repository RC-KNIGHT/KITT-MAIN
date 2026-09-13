/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, cloneAST, formatAST, areASTNodesEqual, extractVariables } from './ast';
import { evaluateAST, generateTruthTable } from './evaluator';

export interface OptimizationMetrics {
  originalGateCount: number;
  optimizedGateCount: number;
  gatesSaved: number;
  savingsPercentage: number;
  architectureType: 'standard_sop' | 'xor_optimized' | 'universal_nand' | 'universal_nor';
  description: string;
}

/**
 * Checks if a set of minterms corresponds to an Odd Parity XOR function
 */
export function isOddParity(minterms: number[], varCount: number): boolean {
  const expectedMinterms: number[] = [];
  const total = 1 << varCount;
  for (let i = 0; i < total; i++) {
    const ones = i.toString(2).split('').filter((c) => c === '1').length;
    if (ones % 2 === 1) {
      expectedMinterms.push(i);
    }
  }
  if (minterms.length !== expectedMinterms.length) return false;
  const set = new Set(minterms);
  return expectedMinterms.every((m) => set.has(m));
}

/**
 * Checks if a set of minterms corresponds to an Even Parity XNOR function
 */
export function isEvenParity(minterms: number[], varCount: number): boolean {
  const expectedMinterms: number[] = [];
  const total = 1 << varCount;
  for (let i = 0; i < total; i++) {
    const ones = i.toString(2).split('').filter((c) => c === '1').length;
    if (ones % 2 === 0) {
      expectedMinterms.push(i);
    }
  }
  if (minterms.length !== expectedMinterms.length) return false;
  const set = new Set(minterms);
  return expectedMinterms.every((m) => set.has(m));
}

/**
 * Detects whether an expression or truth table represents XOR or XNOR logic
 */
export function detectParityPattern(
  minterms: number[],
  varNames: string[]
): { isXOR: boolean; isXNOR: boolean; expression: string; ast: ASTNode } | null {
  const n = varNames.length;
  if (n < 2) return null;

  if (isOddParity(minterms, n)) {
    const varNodes: ASTNode[] = varNames.map((v) => ({ type: 'VAR', value: v }));
    const ast: ASTNode = {
      type: 'XOR',
      children: varNodes,
    };
    return {
      isXOR: true,
      isXNOR: false,
      expression: varNames.join(' ⊕ '),
      ast,
    };
  }

  if (isEvenParity(minterms, n)) {
    const varNodes: ASTNode[] = varNames.map((v) => ({ type: 'VAR', value: v }));
    const ast: ASTNode = {
      type: 'XNOR',
      children: varNodes,
    };
    return {
      isXOR: false,
      isXNOR: true,
      expression: varNames.join(' ⊙ '),
      ast,
    };
  }

  // Check 2-variable XOR subsets in 3 or 4 variables (e.g. F = (A ⊕ B) + C or (A ⊕ B)·C)
  if (n === 3) {
    // Check if F = (A ⊕ B)·C (minterms 5, 6)
    // or (A ⊕ B) + C
    const [A, B, C] = varNames;
    const testPatterns = [
      { name: `(${A} ⊕ ${B}) · ${C}`, minterms: [5, 6], ast: { type: 'AND' as const, children: [{ type: 'XOR' as const, children: [{ type: 'VAR' as const, value: A }, { type: 'VAR' as const, value: B }] }, { type: 'VAR' as const, value: C }] } },
      { name: `(${A} ⊕ ${C}) · ${B}`, minterms: [3, 6], ast: { type: 'AND' as const, children: [{ type: 'XOR' as const, children: [{ type: 'VAR' as const, value: A }, { type: 'VAR' as const, value: C }] }, { type: 'VAR' as const, value: B }] } },
      { name: `(${B} ⊕ ${C}) · ${A}`, minterms: [5, 6], ast: { type: 'AND' as const, children: [{ type: 'XOR' as const, children: [{ type: 'VAR' as const, value: B }, { type: 'VAR' as const, value: C }] }, { type: 'VAR' as const, value: A }] } },
      { name: `(${A} ⊕ ${B}) + ${C}`, minterms: [1, 2, 3, 5, 6, 7], ast: { type: 'OR' as const, children: [{ type: 'XOR' as const, children: [{ type: 'VAR' as const, value: A }, { type: 'VAR' as const, value: B }] }, { type: 'VAR' as const, value: C }] } },
      { name: `(${A} ⊙ ${B}) · ${C}`, minterms: [1, 7], ast: { type: 'AND' as const, children: [{ type: 'XNOR' as const, children: [{ type: 'VAR' as const, value: A }, { type: 'VAR' as const, value: B }] }, { type: 'VAR' as const, value: C }] } },
    ];

    for (const pat of testPatterns) {
      if (pat.minterms.length === minterms.length) {
        const s1 = new Set(minterms);
        if (pat.minterms.every((m) => s1.has(m))) {
          return {
            isXOR: true,
            isXNOR: false,
            expression: pat.name,
            ast: pat.ast,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Simplifies AST by recognizing XOR and XNOR sub-patterns:
 * - AB' + A'B -> A ⊕ B
 * - AB + A'B' -> A ⊙ B
 * - A'B + AB' -> A ⊕ B
 * - (A + B)(A' + B') -> A ⊕ B
 */
export function optimizeXORPatterns(ast: ASTNode): ASTNode {
  if (ast.type === 'VAR' || ast.type === 'CONST') return cloneAST(ast);

  // Recursively optimize children first
  const optChildren = (ast.children || []).map(optimizeXORPatterns);
  const node: ASTNode = { type: ast.type, value: ast.value, children: optChildren };

  // 1. Invert of XOR -> XNOR, Invert of XNOR -> XOR
  if (node.type === 'NOT' && node.children && node.children.length === 1) {
    const child = node.children[0];
    if (child.type === 'XOR') {
      return { type: 'XNOR', children: child.children };
    }
    if (child.type === 'XNOR') {
      return { type: 'XOR', children: child.children };
    }
    if (child.type === 'AND') {
      return { type: 'NAND', children: child.children };
    }
    if (child.type === 'OR') {
      return { type: 'NOR', children: child.children };
    }
  }

  // 2. OR of product terms: Check for pairs that form XOR or XNOR
  if (node.type === 'OR' && node.children && node.children.length >= 2) {
    const remaining = [...node.children];
    const newOrTerms: ASTNode[] = [];

    while (remaining.length > 0) {
      const term1 = remaining.shift()!;
      let paired = false;

      // Look for a pair term
      for (let j = 0; j < remaining.length; j++) {
        const term2 = remaining[j];

        // Check if term1 and term2 form AB' + A'B (XOR) or AB + A'B' (XNOR)
        const xorPair = tryMatchXorPair(term1, term2);
        if (xorPair) {
          remaining.splice(j, 1);
          newOrTerms.push(xorPair);
          paired = true;
          break;
        }
      }

      if (!paired) {
        newOrTerms.push(term1);
      }
    }

    if (newOrTerms.length === 1) return newOrTerms[0];
    return { type: 'OR', children: newOrTerms };
  }

  // 3. AND of sum terms: (A + B)(A' + B') -> A ⊕ B
  if (node.type === 'AND' && node.children && node.children.length >= 2) {
    const remaining = [...node.children];
    const newAndTerms: ASTNode[] = [];

    while (remaining.length > 0) {
      const sum1 = remaining.shift()!;
      let paired = false;

      for (let j = 0; j < remaining.length; j++) {
        const sum2 = remaining[j];
        const posPair = tryMatchPosPair(sum1, sum2);
        if (posPair) {
          remaining.splice(j, 1);
          newAndTerms.push(posPair);
          paired = true;
          break;
        }
      }

      if (!paired) {
        newAndTerms.push(sum1);
      }
    }

    if (newAndTerms.length === 1) return newAndTerms[0];
    return { type: 'AND', children: newAndTerms };
  }

  return node;
}

/**
 * Matches two product terms for XOR (AB' + A'B) or XNOR (AB + A'B')
 */
function tryMatchXorPair(t1: ASTNode, t2: ASTNode): ASTNode | null {
  const getFactors = (n: ASTNode): ASTNode[] => (n.type === 'AND' && n.children ? n.children : [n]);
  const f1 = getFactors(t1);
  const f2 = getFactors(t2);

  if (f1.length === 2 && f2.length === 2) {
    const [a1, b1] = f1;
    const [a2, b2] = f2;

    // Check AB' + A'B
    const isA1NotA2 = (a1.type === 'NOT' && areASTNodesEqual(a1.children![0], a2)) || (a2.type === 'NOT' && areASTNodesEqual(a2.children![0], a1));
    const isB1NotB2 = (b1.type === 'NOT' && areASTNodesEqual(b1.children![0], b2)) || (b2.type === 'NOT' && areASTNodesEqual(b2.children![0], b1));

    if (isA1NotA2 && isB1NotB2) {
      const unprimedA = a1.type === 'NOT' ? a2 : a1;
      const unprimedB = b1.type === 'NOT' ? b2 : b1;

      // Determine if XOR (one complemented in each) or XNOR (both complemented in one)
      const t1Comps = (a1.type === 'NOT' ? 1 : 0) + (b1.type === 'NOT' ? 1 : 0);
      const t2Comps = (a2.type === 'NOT' ? 1 : 0) + (b2.type === 'NOT' ? 1 : 0);

      if (t1Comps === 1 && t2Comps === 1) {
        // AB' + A'B -> A ⊕ B
        return { type: 'XOR', children: [cloneAST(unprimedA), cloneAST(unprimedB)] };
      }
      if ((t1Comps === 0 && t2Comps === 2) || (t1Comps === 2 && t2Comps === 0)) {
        // AB + A'B' -> A ⊙ B
        return { type: 'XNOR', children: [cloneAST(unprimedA), cloneAST(unprimedB)] };
      }
    }

    // Also check crossed: a1 vs b2 and b1 vs a2
    const isA1NotB2 = (a1.type === 'NOT' && areASTNodesEqual(a1.children![0], b2)) || (b2.type === 'NOT' && areASTNodesEqual(b2.children![0], a1));
    const isB1NotA2 = (b1.type === 'NOT' && areASTNodesEqual(b1.children![0], a2)) || (a2.type === 'NOT' && areASTNodesEqual(a2.children![0], b1));

    if (isA1NotB2 && isB1NotA2) {
      const unprimedA = a1.type === 'NOT' ? b2 : a1;
      const unprimedB = b1.type === 'NOT' ? a2 : b1;
      const t1Comps = (a1.type === 'NOT' ? 1 : 0) + (b1.type === 'NOT' ? 1 : 0);
      const t2Comps = (a2.type === 'NOT' ? 1 : 0) + (b2.type === 'NOT' ? 1 : 0);

      if (t1Comps === 1 && t2Comps === 1) {
        return { type: 'XOR', children: [cloneAST(unprimedA), cloneAST(unprimedB)] };
      }
      if ((t1Comps === 0 && t2Comps === 2) || (t1Comps === 2 && t2Comps === 0)) {
        return { type: 'XNOR', children: [cloneAST(unprimedA), cloneAST(unprimedB)] };
      }
    }
  }

  return null;
}

/**
 * Matches two sum terms for POS XOR: (A + B)(A' + B') -> A ⊕ B
 */
function tryMatchPosPair(s1: ASTNode, s2: ASTNode): ASTNode | null {
  const getSumTerms = (n: ASTNode): ASTNode[] => (n.type === 'OR' && n.children ? n.children : [n]);
  const t1 = getSumTerms(s1);
  const t2 = getSumTerms(s2);

  if (t1.length === 2 && t2.length === 2) {
    const [a1, b1] = t1;
    const [a2, b2] = t2;
    // (A + B)(A' + B')
    if (
      areASTNodesEqual(a1, a2.type === 'NOT' ? a2.children![0] : { type: 'CONST', value: 99 }) &&
      areASTNodesEqual(b1, b2.type === 'NOT' ? b2.children![0] : { type: 'CONST', value: 99 })
    ) {
      return { type: 'XOR', children: [cloneAST(a1), cloneAST(b1)] };
    }
  }

  return null;
}

/**
 * Converts a standard SOP AST into an equivalent All-NAND Tree
 * Rule: A + B + C = ((A)' · (B)' · (C)')' = NAND( NAND(A), NAND(B), NAND(C) )
 */
export function convertToUniversalNAND(ast: ASTNode): ASTNode {
  if (ast.type === 'VAR' || ast.type === 'CONST') {
    return cloneAST(ast);
  }

  if (ast.type === 'NOT') {
    // NOT(A) in NAND logic is NAND(A, A)
    const childNAND = convertToUniversalNAND(ast.children![0]);
    return { type: 'NAND', children: [childNAND, cloneAST(childNAND)] };
  }

  if (ast.type === 'AND') {
    // AND(A, B) = NOT(NAND(A, B)) = NAND( NAND(A, B), NAND(A, B) )
    const convertedChildren = (ast.children || []).map(convertToUniversalNAND);
    const innerNAND: ASTNode = { type: 'NAND', children: convertedChildren };
    return { type: 'NAND', children: [innerNAND, cloneAST(innerNAND)] };
  }

  if (ast.type === 'NAND') {
    return {
      type: 'NAND',
      children: (ast.children || []).map(convertToUniversalNAND),
    };
  }

  if (ast.type === 'OR') {
    // OR(A, B, C) = NAND( NOT(A), NOT(B), NOT(C) )
    // Each NOT(X) is NAND(X, X)
    const invertedChildren = (ast.children || []).map((c) => {
      const converted = convertToUniversalNAND(c);
      // If converted is already a product NAND, its output is already inverted, so we feed it directly!
      if (c.type === 'AND') {
        return { type: 'NAND' as const, children: (c.children || []).map(convertToUniversalNAND) };
      }
      return { type: 'NAND' as const, children: [converted, cloneAST(converted)] };
    });

    return { type: 'NAND', children: invertedChildren };
  }

  if (ast.type === 'NOR') {
    // NOR(A, B) = NOT(OR(A, B)) = NOT( NAND(NOT(A), NOT(B)) )
    const orNand = convertToUniversalNAND({ type: 'OR', children: ast.children });
    return { type: 'NAND', children: [orNand, cloneAST(orNand)] };
  }

  if (ast.type === 'XOR') {
    // Classic 4-NAND gate XOR realization:
    // N1 = NAND(A, B)
    // N2 = NAND(A, N1)
    // N3 = NAND(B, N1)
    // Out = NAND(N2, N3)
    const [a, b] = (ast.children || []).map(convertToUniversalNAND);
    const n1: ASTNode = { type: 'NAND', children: [cloneAST(a), cloneAST(b)] };
    const n2: ASTNode = { type: 'NAND', children: [cloneAST(a), cloneAST(n1)] };
    const n3: ASTNode = { type: 'NAND', children: [cloneAST(b), cloneAST(n1)] };
    return { type: 'NAND', children: [n2, n3] };
  }

  if (ast.type === 'XNOR') {
    // XNOR is NOT(XOR) -> NAND(Out_XOR, Out_XOR)
    const xorNAND = convertToUniversalNAND({ type: 'XOR', children: ast.children });
    return { type: 'NAND', children: [xorNAND, cloneAST(xorNAND)] };
  }

  return cloneAST(ast);
}

/**
 * Converts a standard POS AST into an equivalent All-NOR Tree
 * Rule: A · B · C = ((A)' + (B)' + (C)')' = NOR( NOR(A), NOR(B), NOR(C) )
 */
export function convertToUniversalNOR(ast: ASTNode): ASTNode {
  if (ast.type === 'VAR' || ast.type === 'CONST') {
    return cloneAST(ast);
  }

  if (ast.type === 'NOT') {
    // NOT(A) in NOR logic is NOR(A, A)
    const childNOR = convertToUniversalNOR(ast.children![0]);
    return { type: 'NOR', children: [childNOR, cloneAST(childNOR)] };
  }

  if (ast.type === 'OR') {
    // OR(A, B) = NOT(NOR(A, B)) = NOR( NOR(A, B), NOR(A, B) )
    const convertedChildren = (ast.children || []).map(convertToUniversalNOR);
    const innerNOR: ASTNode = { type: 'NOR', children: convertedChildren };
    return { type: 'NOR', children: [innerNOR, cloneAST(innerNOR)] };
  }

  if (ast.type === 'NOR') {
    return {
      type: 'NOR',
      children: (ast.children || []).map(convertToUniversalNOR),
    };
  }

  if (ast.type === 'AND') {
    // AND(A, B, C) = NOR( NOT(A), NOT(B), NOT(C) )
    const invertedChildren = (ast.children || []).map((c) => {
      const converted = convertToUniversalNOR(c);
      if (c.type === 'OR') {
        return { type: 'NOR' as const, children: (c.children || []).map(convertToUniversalNOR) };
      }
      return { type: 'NOR' as const, children: [converted, cloneAST(converted)] };
    });

    return { type: 'NOR', children: invertedChildren };
  }

  if (ast.type === 'NAND') {
    const andNor = convertToUniversalNOR({ type: 'AND', children: ast.children });
    return { type: 'NOR', children: [andNor, cloneAST(andNor)] };
  }

  if (ast.type === 'XOR') {
    // Classic 5-NOR gate XOR or 4-NOR XNOR:
    // N1 = NOR(A, B)
    // N2 = NOR(A, N1)
    // N3 = NOR(B, N1)
    // N4 = NOR(N2, N3)
    // Out = NOR(N4, N4)
    const [a, b] = (ast.children || []).map(convertToUniversalNOR);
    const n1: ASTNode = { type: 'NOR', children: [cloneAST(a), cloneAST(b)] };
    const n2: ASTNode = { type: 'NOR', children: [cloneAST(a), cloneAST(n1)] };
    const n3: ASTNode = { type: 'NOR', children: [cloneAST(b), cloneAST(n1)] };
    const n4: ASTNode = { type: 'NOR', children: [n2, n3] };
    return { type: 'NOR', children: [n4, cloneAST(n4)] };
  }

  if (ast.type === 'XNOR') {
    const [a, b] = (ast.children || []).map(convertToUniversalNOR);
    const n1: ASTNode = { type: 'NOR', children: [cloneAST(a), cloneAST(b)] };
    const n2: ASTNode = { type: 'NOR', children: [cloneAST(a), cloneAST(n1)] };
    const n3: ASTNode = { type: 'NOR', children: [cloneAST(b), cloneAST(n1)] };
    return { type: 'NOR', children: [n2, n3] };
  }

  return cloneAST(ast);
}

/**
 * Counts total logic gates in an AST
 */
export function countASTGates(ast: ASTNode): number {
  if (ast.type === 'VAR' || ast.type === 'CONST') return 0;
  let count = 1;
  if (ast.children) {
    for (const c of ast.children) {
      count += countASTGates(c);
    }
  }
  return count;
}
