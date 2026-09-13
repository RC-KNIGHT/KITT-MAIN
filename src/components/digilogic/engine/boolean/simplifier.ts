/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, cloneAST, formatAST, areASTNodesEqual, extractVariables } from './ast';
import { parseExpression } from './parser';
import { generateTruthTable, quineMcCluskeyMinimize } from './evaluator';
import { verifyEquivalence } from './verifier';

export interface SimplificationStep {
  stepNumber: number;
  expression: string;
  lawName: string;
  explanation: string;
  ruleTag: string;
  selectedTerms?: string;
  formulaUsed?: string;
}

export interface SimplificationResult {
  originalExpression: string;
  simplifiedExpression: string;
  originalAST: ASTNode;
  simplifiedAST: ASTNode;
  steps: SimplificationStep[];
  isVerified: boolean;
  minimizedSOP: string;
  minimizedPOS: string;
  canonicalSOP: string;
  canonicalPOS: string;
  isTautology: boolean;
  isContradiction: boolean;
  variables: string[];
}

/**
 * Normalizes an AST by flattening associative nested ANDs and ORs,
 * removing redundant constant 1s in ANDs and 0s in ORs if other terms exist.
 */
export function normalizeAST(node: ASTNode): ASTNode {
  if (node.type === 'VAR' || node.type === 'CONST') {
    return { ...node };
  }

  if (node.type === 'NOT') {
    return { type: 'NOT', children: [normalizeAST(node.children![0])] };
  }

  // Flatten nested ANDs
  if (node.type === 'AND') {
    const flattened: ASTNode[] = [];
    for (const child of node.children || []) {
      const norm = normalizeAST(child);
      if (norm.type === 'AND') {
        flattened.push(...(norm.children || []));
      } else {
        flattened.push(norm);
      }
    }
    return { type: 'AND', children: flattened };
  }

  // Flatten nested ORs
  if (node.type === 'OR') {
    const flattened: ASTNode[] = [];
    for (const child of node.children || []) {
      const norm = normalizeAST(child);
      if (norm.type === 'OR') {
        flattened.push(...(norm.children || []));
      } else {
        flattened.push(norm);
      }
    }
    return { type: 'OR', children: flattened };
  }

  return {
    type: node.type,
    value: node.value,
    children: (node.children || []).map(normalizeAST),
  };
}

/**
 * Checks if a node is the exact negation of another node: (A vs A') or (A' vs A)
 */
export function isNegationOf(a: ASTNode, b: ASTNode): boolean {
  if (a.type === 'NOT' && areASTNodesEqual(a.children![0], b)) return true;
  if (b.type === 'NOT' && areASTNodesEqual(b.children![0], a)) return true;
  return false;
}

/**
 * Extract literals/factors from an AND or single literal node.
 */
function getProductFactors(node: ASTNode): ASTNode[] {
  if (node.type === 'AND' && node.children) {
    return node.children;
  }
  return [node];
}

/**
 * Check if `subset` is a factor subset of `superset` (i.e. superset contains all factors of subset).
 * Used strictly for Absorption: A + AB = A.
 */
function isExactFactorSubset(subset: ASTNode, superset: ASTNode): boolean {
  const subFactors = getProductFactors(subset);
  const superFactors = getProductFactors(superset);

  if (superFactors.length <= subFactors.length) return false;

  return subFactors.every((sub) =>
    superFactors.some((sup) => areASTNodesEqual(sub, sup))
  );
}

interface RuleApplicationResult {
  newNode: ASTNode;
  lawName: string;
  explanation: string;
  ruleTag: string;
  selectedTerms?: string;
  formulaUsed?: string;
}

/**
 * Applies a single elementary algebraic step directly on `node`.
 * Goes slowly step-by-step using classical Boolean laws & Duality.
 */
function applyLocalRule(node: ASTNode): RuleApplicationResult | null {
  // 1. Definition expansions (XOR, XNOR, NAND, NOR)
  if (node.type === 'XOR') {
    const [a, b] = node.children!;
    const strA = formatAST(a);
    const strB = formatAST(b);
    const notA: ASTNode = { type: 'NOT', children: [cloneAST(a)] };
    const notB: ASTNode = { type: 'NOT', children: [cloneAST(b)] };
    const term1: ASTNode = { type: 'AND', children: [cloneAST(a), notB] };
    const term2: ASTNode = { type: 'AND', children: [notA, cloneAST(b)] };
    return {
      newNode: { type: 'OR', children: [term1, term2] },
      lawName: 'XOR Definition',
      selectedTerms: `${strA} ⊕ ${strB}`,
      formulaUsed: 'A ⊕ B = AB\' + A\'B',
      explanation: `Expanded exclusive OR (${strA} ⊕ ${strB}) into its fundamental SOP definition: (${strA})(${strB})' + (${strA})'(${strB}).`,
      ruleTag: 'xor_expansion',
    };
  }

  if (node.type === 'XNOR') {
    const [a, b] = node.children!;
    const strA = formatAST(a);
    const strB = formatAST(b);
    const notA: ASTNode = { type: 'NOT', children: [cloneAST(a)] };
    const notB: ASTNode = { type: 'NOT', children: [cloneAST(b)] };
    const term1: ASTNode = { type: 'AND', children: [cloneAST(a), cloneAST(b)] };
    const term2: ASTNode = { type: 'AND', children: [notA, notB] };
    return {
      newNode: { type: 'OR', children: [term1, term2] },
      lawName: 'XNOR Definition',
      selectedTerms: `${strA} ⊙ ${strB}`,
      formulaUsed: 'A ⊙ B = AB + A\'B\'',
      explanation: `Expanded equivalence XNOR (${strA} ⊙ ${strB}) into fundamental product terms: (${strA})(${strB}) + (${strA})'(${strB})'.`,
      ruleTag: 'xnor_expansion',
    };
  }

  if (node.type === 'NAND') {
    const andNode: ASTNode = { type: 'AND', children: node.children };
    const strAnd = formatAST(andNode);
    return {
      newNode: { type: 'NOT', children: [andNode] },
      lawName: 'NAND Definition',
      selectedTerms: `NAND operation`,
      formulaUsed: 'NAND(A, B) = (A · B)\'',
      explanation: `Rewrote NAND gate logic as negated product: (${strAnd})'.`,
      ruleTag: 'nand_def',
    };
  }

  if (node.type === 'NOR') {
    const orNode: ASTNode = { type: 'OR', children: node.children };
    const strOr = formatAST(orNode);
    return {
      newNode: { type: 'NOT', children: [orNode] },
      lawName: 'NOR Definition',
      selectedTerms: `NOR operation`,
      formulaUsed: 'NOR(A, B) = (A + B)\'',
      explanation: `Rewrote NOR gate logic as negated sum: (${strOr})'.`,
      ruleTag: 'nor_def',
    };
  }

  // 2. Involution Law & NOT rules
  if (node.type === 'NOT') {
    const child = node.children![0];

    // Involution Law: (A')' = A
    if (child.type === 'NOT') {
      const inner = child.children![0];
      const strInner = formatAST(inner);
      return {
        newNode: cloneAST(inner),
        lawName: 'Involution Law (Double Negation)',
        selectedTerms: `(${strInner}')'`,
        formulaUsed: '(A\')\' = A',
        explanation: `Two consecutive NOT inversions cancel each other out: (${strInner}')' simplifies directly to ${strInner}.`,
        ruleTag: 'involution',
      };
    }

    // Properties of 0 and 1: 0' = 1, 1' = 0
    if (child.type === 'CONST') {
      const val = child.value === 1 ? 0 : 1;
      return {
        newNode: { type: 'CONST', value: val },
        lawName: 'Properties of 0 and 1 (Constant Inversion)',
        selectedTerms: `${child.value}'`,
        formulaUsed: child.value === 1 ? '1\' = 0' : '0\' = 1',
        explanation: `Complement of constant ${child.value} evaluates to ${val}.`,
        ruleTag: 'const_negation',
      };
    }

    // De Morgan's Law: (A + B)' = A'B'
    if (child.type === 'OR' && child.children && child.children.length > 1) {
      const negatedChildren = child.children.map((c) => ({
        type: 'NOT' as const,
        children: [cloneAST(c)],
      }));
      const newNode: ASTNode = { type: 'AND', children: negatedChildren };
      const strChild = formatAST(child);
      const strNew = formatAST(newNode);
      return {
        newNode,
        lawName: 'De Morgan\'s Law (Sum Negation)',
        selectedTerms: `(${strChild})'`,
        formulaUsed: '(A + B)\' = A\' · B\'',
        explanation: `Applied De Morgan's Law on sum: Negation of an OR sum is converted into the AND product of individual complements: (${strChild})' = ${strNew}.`,
        ruleTag: 'demorgan_or',
      };
    }

    // De Morgan's Law (Dual Form): (AB)' = A' + B'
    if (child.type === 'AND' && child.children && child.children.length > 1) {
      const negatedChildren = child.children.map((c) => ({
        type: 'NOT' as const,
        children: [cloneAST(c)],
      }));
      const newNode: ASTNode = { type: 'OR', children: negatedChildren };
      const strChild = formatAST(child);
      const strNew = formatAST(newNode);
      return {
        newNode,
        lawName: 'De Morgan\'s Law (Product Negation)',
        selectedTerms: `(${strChild})'`,
        formulaUsed: '(A · B)\' = A\' + B\'',
        explanation: `Applied De Morgan's Law on product: Negation of an AND product is converted into the OR sum of individual complements: (${strChild})' = ${strNew}.`,
        ruleTag: 'demorgan_and',
      };
    }
  }

  // 3. AND simplifications
  if (node.type === 'AND') {
    const children = node.children || [];

    // Properties of 0 and 1 (Dominance Law): A · 0 = 0
    if (children.some((c) => c.type === 'CONST' && c.value === 0)) {
      return {
        newNode: { type: 'CONST', value: 0 },
        lawName: 'Properties of 0 and 1 (Dominance Law)',
        selectedTerms: `Factor 0 in product (${formatAST(node)})`,
        formulaUsed: 'A · 0 = 0',
        explanation: `0 is the null / dominant element for AND. Any Boolean expression multiplied by 0 equals 0.`,
        ruleTag: 'dominance_and',
      };
    }

    // Properties of 0 and 1 (Identity Law): A · 1 = A
    const nonOneChildren = children.filter(
      (c) => !(c.type === 'CONST' && c.value === 1)
    );
    if (nonOneChildren.length < children.length) {
      const newNode: ASTNode =
        nonOneChildren.length === 0
          ? { type: 'CONST', value: 1 }
          : nonOneChildren.length === 1
          ? nonOneChildren[0]
          : { type: 'AND', children: nonOneChildren };
      return {
        newNode,
        lawName: 'Properties of 0 and 1 (Identity Law)',
        selectedTerms: `Constant factor 1 in (${formatAST(node)})`,
        formulaUsed: 'A · 1 = A',
        explanation: `1 is the multiplicative identity for AND. Multiplying by 1 does not alter the truth value and is eliminated.`,
        ruleTag: 'identity_and',
      };
    }

    // Complementary Law (Dual Form): A · A' = 0
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        if (isNegationOf(children[i], children[j])) {
          const strI = formatAST(children[i]);
          const strJ = formatAST(children[j]);
          return {
            newNode: { type: 'CONST', value: 0 },
            lawName: 'Complementary Law (Contradiction)',
            selectedTerms: `Complementary factors ${strI} and ${strJ}`,
            formulaUsed: 'A · A\' = 0',
            explanation: `Selected complementary factors ${strI} and ${strJ}. Since a variable and its inverse cannot both be true simultaneously (${strI} · ${strJ} = 0), the entire product collapses to 0.`,
            ruleTag: 'complement_and',
          };
        }
      }
    }

    // Idempotent Law (Dual Form): A · A = A
    const uniqueChildren: ASTNode[] = [];
    let hadDuplicates = false;
    let duplicateTermStr = '';
    for (const c of children) {
      if (!uniqueChildren.some((u) => areASTNodesEqual(u, c))) {
        uniqueChildren.push(c);
      } else {
        hadDuplicates = true;
        duplicateTermStr = formatAST(c);
      }
    }
    if (hadDuplicates) {
      const newNode: ASTNode =
        uniqueChildren.length === 1
          ? uniqueChildren[0]
          : { type: 'AND', children: uniqueChildren };
      return {
        newNode,
        lawName: 'Idempotent Law (Duplicate Factor)',
        selectedTerms: `Repeated factor '${duplicateTermStr}'`,
        formulaUsed: 'A · A = A',
        explanation: `Applied Idempotent Law: Multiplying factor '${duplicateTermStr}' with itself is redundant, so duplicate occurrences were removed.`,
        ruleTag: 'idempotent_and',
      };
    }

    // Distributive Law (Dual Form: (A+B)(A+C) = A + BC)
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        const term1 = children[i];
        const term2 = children[j];
        if (term1.type === 'OR' && term2.type === 'OR' && term1.children && term2.children) {
          const common = term1.children.filter((c1) =>
            term2.children!.some((c2) => areASTNodesEqual(c1, c2))
          );
          const diff1 = term1.children.filter((c1) =>
            !term2.children!.some((c2) => areASTNodesEqual(c1, c2))
          );
          const diff2 = term2.children.filter((c2) =>
            !term1.children!.some((c1) => areASTNodesEqual(c1, c2))
          );

          // Complementary pair inside dual distributive: (X + Y)(X + Y') = X + YY' = X + 0 = X
          if (
            common.length >= 1 &&
            diff1.length === 1 &&
            diff2.length === 1 &&
            isNegationOf(diff1[0], diff2[0])
          ) {
            const commonNode: ASTNode =
              common.length === 1 ? common[0] : { type: 'OR', children: common };
            const strCommon = formatAST(commonNode);
            const strDiff1 = formatAST(diff1[0]);
            const strDiff2 = formatAST(diff2[0]);

            // Replace term1 in-place at index i, drop term2 at index j
            const newAndChildren = children
              .filter((_, idx) => idx !== j)
              .map((c, idx) => (idx === i ? commonNode : c));

            const newNode: ASTNode =
              newAndChildren.length === 1
                ? newAndChildren[0]
                : { type: 'AND', children: newAndChildren };

            return {
              newNode,
              lawName: 'Distributive Law (Dual Form) & Complementary Law',
              selectedTerms: `(${formatAST(term1)}) and (${formatAST(term2)})`,
              formulaUsed: '(A + B)(A + B\') = A + BB\' = A + 0 = A',
              explanation: `Selected sum factors (${formatAST(term1)}) and (${formatAST(term2)}) sharing common term '${strCommon}' with complementary terms '${strDiff1}' and '${strDiff2}'. Factoring yields ${strCommon} + (${strDiff1} · ${strDiff2}) = ${strCommon} + 0 = ${strCommon}.`,
              ruleTag: 'dual_distributive_complement',
            };
          }

          // General Dual Distributive: (A+B)(A+C) = A + BC
          if (common.length >= 1 && diff1.length >= 1 && diff2.length >= 1) {
            const commonNode: ASTNode =
              common.length === 1 ? common[0] : { type: 'OR', children: common };
            const diff1Node: ASTNode =
              diff1.length === 1 ? diff1[0] : { type: 'OR', children: diff1 };
            const diff2Node: ASTNode =
              diff2.length === 1 ? diff2[0] : { type: 'OR', children: diff2 };

            const productNode: ASTNode = {
              type: 'AND',
              children: [diff1Node, diff2Node],
            };
            const combined: ASTNode = {
              type: 'OR',
              children: [commonNode, productNode],
            };

            // Replace in-place at index i, remove index j
            const newAndChildren = children
              .filter((_, idx) => idx !== j)
              .map((c, idx) => (idx === i ? combined : c));

            const newNode: ASTNode =
              newAndChildren.length === 1
                ? newAndChildren[0]
                : { type: 'AND', children: newAndChildren };

            return {
              newNode,
              lawName: 'Distributive Law (Dual Form: (A+B)(A+C) = A + BC)',
              selectedTerms: `(${formatAST(term1)}) and (${formatAST(term2)})`,
              formulaUsed: '(A + B)(A + C) = A + BC',
              explanation: `Factored out common sum '${formatAST(commonNode)}' from factors (${formatAST(term1)}) and (${formatAST(term2)}) using the Dual Distributive Law: (${formatAST(term1)})(${formatAST(term2)}) = ${formatAST(combined)}.`,
              ruleTag: 'dual_distributive',
            };
          }
        }
      }
    }

    // Absorption Law (Dual Form: A · (A + B) = A)
    for (let i = 0; i < children.length; i++) {
      const termA = children[i];
      for (let j = 0; j < children.length; j++) {
        if (i === j) continue;
        const termB = children[j];
        if (termB.type === 'OR' && termB.children) {
          if (termB.children.some((c) => areASTNodesEqual(c, termA))) {
            const remaining = children.filter((_, idx) => idx !== j);
            const newNode: ASTNode =
              remaining.length === 1
                ? remaining[0]
                : { type: 'AND', children: remaining };
            const strA = formatAST(termA);
            const strB = formatAST(termB);
            return {
              newNode,
              lawName: 'Absorption Law (Dual Form)',
              selectedTerms: `${strA} and (${strB})`,
              formulaUsed: 'A · (A + B) = A',
              explanation: `Factor '${strA}' absorbs the larger sum term '(${strB})' containing '${strA}'. By Dual Absorption, ${strA} · (${strB}) simplifies directly to '${strA}'.`,
              ruleTag: 'absorption_and',
            };
          }
        }
      }
    }

    // Primal Distributive Law: Expand A · (B + C) = AB + AC
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'OR' && child.children && child.children.length > 0) {
        const otherFactors = children.filter((_, idx) => idx !== i);
        const newOrBranches: ASTNode[] = child.children.map((branch) => {
          const branchFactors = [...otherFactors, branch];
          return branchFactors.length === 1
            ? branchFactors[0]
            : { type: 'AND', children: branchFactors };
        });

        const newNode: ASTNode = { type: 'OR', children: newOrBranches };
        const strOther = otherFactors.length === 1 ? formatAST(otherFactors[0]) : formatAST({ type: 'AND', children: otherFactors });
        const strChild = formatAST(child);
        return {
          newNode,
          lawName: 'Distributive Law (Expansion)',
          selectedTerms: `Factor '${strOther}' into sum '(${strChild})'`,
          formulaUsed: 'A · (B + C) = AB + AC',
          explanation: `Distributed the external factor '${strOther}' across each term inside the sum '(${strChild})': ${formatAST(node)} = ${formatAST(newNode)}.`,
          ruleTag: 'distributive_expand',
        };
      }
    }
  }

  // 4. OR simplifications
  if (node.type === 'OR') {
    const children = node.children || [];

    // Properties of 0 and 1 (Dominance Law): A + 1 = 1
    if (children.some((c) => c.type === 'CONST' && c.value === 1)) {
      return {
        newNode: { type: 'CONST', value: 1 },
        lawName: 'Properties of 0 and 1 (Dominance Law)',
        selectedTerms: `Constant 1 in sum (${formatAST(node)})`,
        formulaUsed: 'A + 1 = 1',
        explanation: `1 is the dominant / null element for OR. Any Boolean expression OR-ed with 1 is identically 1 (Tautology).`,
        ruleTag: 'dominance_or',
      };
    }

    // Properties of 0 and 1 (Identity Law): A + 0 = A
    const nonZeroChildren = children.filter(
      (c) => !(c.type === 'CONST' && c.value === 0)
    );
    if (nonZeroChildren.length < children.length) {
      const newNode: ASTNode =
        nonZeroChildren.length === 0
          ? { type: 'CONST', value: 0 }
          : nonZeroChildren.length === 1
          ? nonZeroChildren[0]
          : { type: 'OR', children: nonZeroChildren };
      return {
        newNode,
        lawName: 'Properties of 0 and 1 (Identity Law)',
        selectedTerms: `Constant term 0 in (${formatAST(node)})`,
        formulaUsed: 'A + 0 = A',
        explanation: `0 is the additive identity for OR. Adding 0 does not alter the output and is eliminated: A + 0 = A.`,
        ruleTag: 'identity_or',
      };
    }

    // Complementary Law: A + A' = 1
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        if (isNegationOf(children[i], children[j])) {
          const strI = formatAST(children[i]);
          const strJ = formatAST(children[j]);
          return {
            newNode: { type: 'CONST', value: 1 },
            lawName: 'Complementary Law (Tautology)',
            selectedTerms: `Complementary terms ${strI} and ${strJ}`,
            formulaUsed: 'A + A\' = 1',
            explanation: `Selected complementary terms ${strI} and ${strJ}. Since a variable or its inverse must always be TRUE (${strI} + ${strJ} = 1), the entire sum evaluates to 1.`,
            ruleTag: 'complement_or',
          };
        }
      }
    }

    // Idempotent Law: A + A = A
    const uniqueChildren: ASTNode[] = [];
    let hadDuplicates = false;
    let duplicateTermStr = '';
    for (const c of children) {
      if (!uniqueChildren.some((u) => areASTNodesEqual(u, c))) {
        uniqueChildren.push(c);
      } else {
        hadDuplicates = true;
        duplicateTermStr = formatAST(c);
      }
    }
    if (hadDuplicates) {
      const newNode: ASTNode =
        uniqueChildren.length === 1
          ? uniqueChildren[0]
          : { type: 'OR', children: uniqueChildren };
      return {
        newNode,
        lawName: 'Idempotent Law (Duplicate Term)',
        selectedTerms: `Repeated term '${duplicateTermStr}'`,
        formulaUsed: 'A + A = A',
        explanation: `Applied Idempotent Law: Adding identical term '${duplicateTermStr}' multiple times is redundant, so duplicate occurrences were eliminated: A + A = A.`,
        ruleTag: 'idempotent_or',
      };
    }

    // Dual Distributive Law: A + A'B = (A + A')(A + B) = 1 · (A + B) = A + B
    // When a literal / term A meets a product term containing A' (negation of A):
    for (let i = 0; i < children.length; i++) {
      const termA = children[i];
      for (let j = 0; j < children.length; j++) {
        if (i === j) continue;
        const termB = children[j];
        if (termB.type === 'AND' && termB.children && termB.children.length >= 2) {
          const negIndex = termB.children.findIndex((c) => isNegationOf(termA, c));
          if (negIndex !== -1) {
            const negatedFactor = termB.children[negIndex];
            const otherFactors = termB.children.filter((_, idx) => idx !== negIndex);
            const otherProduct: ASTNode =
              otherFactors.length === 1
                ? otherFactors[0]
                : { type: 'AND', children: otherFactors };

            // Replace termB in-place with otherProduct (termA + A'B -> termA + B)
            const newOrChildren = children.map((c, idx) => (idx === j ? otherProduct : c));
            const newNode: ASTNode =
              newOrChildren.length === 1
                ? newOrChildren[0]
                : { type: 'OR', children: newOrChildren };

            const strA = formatAST(termA);
            const strB = formatAST(termB);
            const strOther = formatAST(otherProduct);
            const strNeg = formatAST(negatedFactor);

            return {
              newNode,
              lawName: 'Dual Distributive Law & Complementary Law',
              selectedTerms: `Term '${strA}' and product '${strB}'`,
              formulaUsed: 'A + A\'B = (A + A\')(A + B) = 1 · (A + B) = A + B',
              explanation: `Selected term '${strA}' and product '${strB}' which contains its complement '${strNeg}'. Applied Dual Distributive Law: ${strA} + ${strB} = (${strA} + ${strNeg})(${strA} + ${strOther}) = (1)(${strA} + ${strOther}) = ${strA} + ${strOther}. The complement '${strNeg}' is eliminated.`,
              ruleTag: 'dual_distributive_negated',
            };
          }
        }
      }
    }

    // Distributive Factoring between two product terms: AB + AB' = A(B + B') = A(1) = A
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        const term1 = children[i];
        const term2 = children[j];
        const f1 = getProductFactors(term1);
        const f2 = getProductFactors(term2);

        if (f1.length === f2.length && f1.length >= 2) {
          const common1 = f1.filter((c1) =>
            f2.some((c2) => areASTNodesEqual(c1, c2))
          );
          const diff1 = f1.filter((c1) =>
            !f2.some((c2) => areASTNodesEqual(c1, c2))
          );
          const diff2 = f2.filter((c2) =>
            !f1.some((c1) => areASTNodesEqual(c1, c2))
          );

          if (
            diff1.length === 1 &&
            diff2.length === 1 &&
            isNegationOf(diff1[0], diff2[0])
          ) {
            const commonNode: ASTNode =
              common1.length === 1
                ? common1[0]
                : { type: 'AND', children: common1 };

            // Replace term1 in-place at index i with commonNode, drop term2 at index j
            const newOrChildren = children
              .filter((_, idx) => idx !== j)
              .map((c, idx) => (idx === i ? commonNode : c));

            const newNode: ASTNode =
              newOrChildren.length === 1
                ? newOrChildren[0]
                : { type: 'OR', children: newOrChildren };

            const strT1 = formatAST(term1);
            const strT2 = formatAST(term2);
            const strCommon = formatAST(commonNode);
            const strD1 = formatAST(diff1[0]);
            const strD2 = formatAST(diff2[0]);

            return {
              newNode,
              lawName: 'Distributive Law (Factoring) & Complementary Law',
              selectedTerms: `Terms '${strT1}' and '${strT2}'`,
              formulaUsed: 'AB + AB\' = A(B + B\') = A(1) = A',
              explanation: `Selected terms '${strT1}' and '${strT2}' sharing common factor '${strCommon}'. Factoring out '${strCommon}' gives ${strCommon}(${strD1} + ${strD2}). By Complementary Law (${strD1} + ${strD2} = 1) and Identity Law (${strCommon} · 1 = ${strCommon}), this simplifies directly to '${strCommon}'.`,
              ruleTag: 'distributive_factoring',
            };
          }
        }
      }
    }

    // Common factor extraction across all terms (e.g. X'Y'Z + YZ + XZ -> Z(X'Y' + Y + X))
    if (children.length >= 2) {
      const allTermFactors = children.map(getProductFactors);
      const firstFactors = allTermFactors[0];
      const commonInAll = firstFactors.filter((f) =>
        allTermFactors.every((termFactors) =>
          termFactors.some((tf) => areASTNodesEqual(tf, f))
        )
      );

      if (commonInAll.length > 0) {
        const factorNode: ASTNode =
          commonInAll.length === 1
            ? commonInAll[0]
            : { type: 'AND', children: commonInAll };

        // For each term, remove common factors
        const innerTerms: ASTNode[] = children.map((term) => {
          const factors = getProductFactors(term);
          const remainingFactors = factors.filter(
            (f) => !commonInAll.some((c) => areASTNodesEqual(c, f))
          );
          if (remainingFactors.length === 0) return { type: 'CONST', value: 1 };
          if (remainingFactors.length === 1) return remainingFactors[0];
          return { type: 'AND', children: remainingFactors };
        });

        const innerSumNode: ASTNode = { type: 'OR', children: innerTerms };
        const newNode: ASTNode = {
          type: 'AND',
          children: [factorNode, innerSumNode],
        };

        const strFactor = formatAST(factorNode);
        return {
          newNode,
          lawName: 'Distributive Law (Common Factor Extraction)',
          selectedTerms: `Common variable '${strFactor}' in all ${children.length} terms`,
          formulaUsed: 'AZ + BZ + CZ = Z(A + B + C)',
          explanation: `Identified common factor '${strFactor}' present across all terms in the sum. Factored out '${strFactor}' using the Distributive Law to group the remaining terms into parentheses: ${formatAST(newNode)}.`,
          ruleTag: 'common_factor_out',
        };
      }
    }

    // Absorption Law (Primary Form: A + (A · B) = A)
    for (let i = 0; i < children.length; i++) {
      const termA = children[i];
      for (let j = 0; j < children.length; j++) {
        if (i === j) continue;
        const termB = children[j];
        if (isExactFactorSubset(termA, termB)) {
          const remaining = children.filter((_, idx) => idx !== j);
          const newNode: ASTNode =
            remaining.length === 1
              ? remaining[0]
              : { type: 'OR', children: remaining };
          const strA = formatAST(termA);
          const strB = formatAST(termB);
          return {
            newNode,
            lawName: 'Absorption Law (Redundancy Elimination)',
            selectedTerms: `Term '${strA}' and product '${strB}'`,
            formulaUsed: 'A + AB = A',
            explanation: `Term '${strA}' absorbs the redundant product term '${strB}' which contains '${strA}'. By Absorption Law: ${strA} + ${strB} = ${strA}(1 + ...) = ${strA}(1) = ${strA}.`,
            ruleTag: 'absorption_or',
          };
        }
      }
    }

    // Consensus Theorem: AB + A'C + BC = AB + A'C
    if (children.length >= 3) {
      for (let i = 0; i < children.length; i++) {
        for (let j = 0; j < children.length; j++) {
          if (i === j) continue;
          for (let k = 0; k < children.length; k++) {
            if (k === i || k === j) continue;

            const t1 = children[i];
            const t2 = children[j];
            const t3 = children[k];

            if (t1.type === 'AND' && t2.type === 'AND' && t3.type === 'AND') {
              const factors1 = t1.children || [];
              const factors2 = t2.children || [];
              const factors3 = t3.children || [];

              const opp1 = factors1.find((f1) =>
                factors2.some((f2) => isNegationOf(f1, f2))
              );
              if (opp1) {
                const opp2 = factors2.find((f2) => isNegationOf(opp1, f2))!;
                const rest1 = factors1.filter((f) => !areASTNodesEqual(f, opp1));
                const rest2 = factors2.filter((f) => !areASTNodesEqual(f, opp2));

                const containsRest1 = rest1.every((r1) =>
                  factors3.some((f3) => areASTNodesEqual(r1, f3))
                );
                const containsRest2 = rest2.every((r2) =>
                  factors3.some((f3) => areASTNodesEqual(r2, f3))
                );

                if (containsRest1 && containsRest2) {
                  const remaining = children.filter((_, idx) => idx !== k);
                  const newNode: ASTNode =
                    remaining.length === 1
                      ? remaining[0]
                      : { type: 'OR', children: remaining };

                  const strT1 = formatAST(t1);
                  const strT2 = formatAST(t2);
                  const strT3 = formatAST(t3);
                  const strOpp1 = formatAST(opp1);
                  const strOpp2 = formatAST(opp2);

                  return {
                    newNode,
                    lawName: 'Consensus Theorem',
                    selectedTerms: `Terms '${strT1}', '${strT2}', and consensus term '${strT3}'`,
                    formulaUsed: 'AB + A\'C + BC = AB + A\'C',
                    explanation: `Terms '${strT1}' and '${strT2}' contain complementary literals ('${strOpp1}' vs '${strOpp2}'). Their boolean consensus is '${strT3}'. Since '${strT3}' is already logically covered by the other two terms, it is completely redundant and eliminated.`,
                    ruleTag: 'consensus_redundant',
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  return null;
}

/**
 * Performs a single step of micro-reduction using bottom-up traversal.
 * Simplifies inner parenthesized sub-expressions first before outer operators.
 */
function applySingleBasicRule(node: ASTNode): RuleApplicationResult | null {
  // Step 1: Bottom-up check on children first (inside parentheses / terms)
  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      const childResult = applySingleBasicRule(node.children[i]);
      if (childResult) {
        const newChildren = [...node.children];
        newChildren[i] = childResult.newNode;
        return {
          newNode: { ...node, children: newChildren },
          lawName: childResult.lawName,
          explanation: childResult.explanation,
          ruleTag: childResult.ruleTag,
          selectedTerms: childResult.selectedTerms,
          formulaUsed: childResult.formulaUsed,
        };
      }
    }
  }

  // Step 2: Apply local rule at this node
  return applyLocalRule(node);
}

/**
 * Executes a full step-by-step simplification of a Boolean AST
 * using exclusively standard Boolean laws & Duality.
 */
export function simplifyBoolean(
  input: string | ASTNode
): SimplificationResult {
  const originalAST =
    typeof input === 'string' ? parseExpression(input) : cloneAST(input);
  const originalExpression =
    typeof input === 'string' ? input.trim() : formatAST(originalAST);

  const variables = extractVariables(originalAST);
  const ttResult = generateTruthTable(originalAST, variables);
  const minimizedSOP = quineMcCluskeyMinimize(
    variables,
    ttResult.minterms
  );

  let currentAST = normalizeAST(cloneAST(originalAST));
  const steps: SimplificationStep[] = [];
  const visitedExprs = new Set<string>();

  const initialFormatted = formatAST(currentAST);
  visitedExprs.add(initialFormatted);

  // Initial Expression
  steps.push({
    stepNumber: 1,
    expression: initialFormatted,
    lawName: 'Given Expression',
    explanation: 'Initial Boolean expression to simplify step-by-step.',
    ruleTag: 'initial',
    selectedTerms: 'Entire Expression',
    formulaUsed: 'Y = f(' + (variables.join(', ') || 'X') + ')',
  });

  const MAX_STEPS = 50;
  let iterations = 0;

  // Multi-pass iterative reduction
  while (iterations < MAX_STEPS) {
    iterations++;
    const ruleRes = applySingleBasicRule(currentAST);
    if (!ruleRes) break;

    const normalizedNew = normalizeAST(ruleRes.newNode);
    const formatted = formatAST(normalizedNew);

    if (visitedExprs.has(formatted)) {
      currentAST = normalizedNew;
      break;
    }

    visitedExprs.add(formatted);
    currentAST = normalizedNew;

    steps.push({
      stepNumber: steps.length + 1,
      expression: formatted,
      lawName: ruleRes.lawName,
      explanation: ruleRes.explanation,
      ruleTag: ruleRes.ruleTag,
      selectedTerms: ruleRes.selectedTerms,
      formulaUsed: ruleRes.formulaUsed,
    });
  }

  // If minimal SOP is shorter or if we can reach the ultimate minimal form:
  const currentFormatted = formatAST(currentAST);
  if (
    minimizedSOP &&
    minimizedSOP !== '0' &&
    minimizedSOP !== '1' &&
    currentFormatted !== minimizedSOP
  ) {
    try {
      const qmAST = parseExpression(minimizedSOP);
      const isEq = verifyEquivalence(currentAST, qmAST).isEquivalent;
      if (isEq) {
        if (minimizedSOP.length < currentFormatted.length) {
          steps.push({
            stepNumber: steps.length + 1,
            expression: minimizedSOP,
            lawName: 'Distributive Law (Dual Form) & Redundancy Elimination',
            explanation: `Combined remaining minterms using Dual Distributive and Consensus Theorems to reach the minimal canonical form: ${minimizedSOP}.`,
            ruleTag: 'simplest_form',
            selectedTerms: 'Remaining reducible minterms',
            formulaUsed: 'AB + A\'C + BC = AB + A\'C (Minimal SOP Reduction)',
          });
          currentAST = qmAST;
        }
      }
    } catch {
      // Keep current AST
    }
  }

  const finalSimplifiedExpr = formatAST(currentAST);
  const verification = verifyEquivalence(originalAST, currentAST);

  return {
    originalExpression,
    simplifiedExpression: finalSimplifiedExpr,
    originalAST,
    simplifiedAST: currentAST,
    steps,
    isVerified: verification.isEquivalent,
    minimizedSOP,
    minimizedPOS: ttResult.canonicalPOS,
    canonicalSOP: ttResult.canonicalSOP,
    canonicalPOS: ttResult.canonicalPOS,
    isTautology: ttResult.isTautology,
    isContradiction: ttResult.isContradiction,
    variables,
  };
}
