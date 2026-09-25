/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { detectParityPattern } from './boolean/optimizer';

export interface KMapCell {
  row: number;
  col: number;
  mintermIndex: number;
  value: 0 | 1;
  binaryString: string;
  rowGray: string;
  colGray: string;
}

export interface KMapGroup {
  id: string;
  color: string;
  cells: { row: number; col: number; minterm: number }[];
  term: string; // Minimized term string like "A'B" or "CD'"
  type: '1s' | '0s';
  width: number;
  height: number;
  startRow: number;
  startCol: number;
  isWrapAround?: boolean;
}

export interface KMapResult {
  variableCount: 2 | 3 | 4;
  varNames: string[];
  rowVarNames: string[];
  colVarNames: string[];
  rowHeaders: string[]; // Gray code: ['0', '1'] or ['00', '01', '11', '10']
  colHeaders: string[];
  grid: KMapCell[][];
  groups: KMapGroup[];
  minimizedSOP: string;
  minimizedPOS: string;
  minterms: number[];
  maxterms: number[];
  // Advanced & Universal Gate Syntheses
  xorOptimized: {
    hasPattern: boolean;
    isXOR: boolean;
    isXNOR: boolean;
    equation: string;
    gateCount: number;
    savedGates: number;
    savingsPercent: number;
  };
  universalNAND: {
    equation: string;
    gateCount: number;
    icChips: number; // 7400 Quad 2-input NAND packages
  };
  universalNOR: {
    equation: string;
    gateCount: number;
    icChips: number; // 7402 Quad 2-input NOR packages
  };
  standardGateCount: number;
}

const GROUP_COLORS = [
  '#A58D66', // antique gold
  '#407E8C', // oceanic teal
  '#DFCCA8', // light gold sand
  '#76B4C2', // bright teal
  '#8C7654', // deep gold
  '#5397A6', // soft teal
];

/**
 * Generate full K-Map grid and optimal groupings for 2, 3, or 4 variables
 */
export function generateKMap(
  varCount: 2 | 3 | 4,
  truthTableValues: Record<number, 0 | 1>,
  customVarNames?: string[]
): KMapResult {
  const defaultVarNames = ['A', 'B', 'C', 'D'].slice(0, varCount);
  const varNames =
    customVarNames && customVarNames.length >= varCount
      ? customVarNames.slice(0, varCount)
      : defaultVarNames;

  let rowVarNames: string[] = [];
  let colVarNames: string[] = [];
  let rowGray: string[] = [];
  let colGray: string[] = [];

  if (varCount === 2) {
    rowVarNames = [varNames[0]]; // A
    colVarNames = [varNames[1]]; // B
    rowGray = ['0', '1'];
    colGray = ['0', '1'];
  } else if (varCount === 3) {
    rowVarNames = [varNames[0]]; // A
    colVarNames = [varNames[1], varNames[2]]; // BC
    rowGray = ['0', '1'];
    colGray = ['00', '01', '11', '10'];
  } else {
    // 4 variables: AB \ CD
    rowVarNames = [varNames[0], varNames[1]]; // AB
    colVarNames = [varNames[2], varNames[3]]; // CD
    rowGray = ['00', '01', '11', '10'];
    colGray = ['00', '01', '11', '10'];
  }

  const numRows = rowGray.length;
  const numCols = colGray.length;
  const grid: KMapCell[][] = [];
  const minterms: number[] = [];
  const maxterms: number[] = [];

  for (let r = 0; r < numRows; r++) {
    grid[r] = [];
    for (let c = 0; c < numCols; c++) {
      const fullBin = rowGray[r] + colGray[c];
      const mintermIndex = parseInt(fullBin, 2);
      const val =
        truthTableValues[mintermIndex] !== undefined
          ? truthTableValues[mintermIndex]
          : 0;

      grid[r][c] = {
        row: r,
        col: c,
        mintermIndex,
        value: val,
        binaryString: fullBin,
        rowGray: rowGray[r],
        colGray: colGray[c],
      };

      if (val === 1) {
        minterms.push(mintermIndex);
      } else {
        maxterms.push(mintermIndex);
      }
    }
  }

  // Find optimal rectangular groups of 1s (Powers of 2: 16, 8, 4, 2, 1)
  const groups = findOptimalKMapGroups(
    grid,
    numRows,
    numCols,
    varNames,
    varCount
  );

  // Derive Minimized SOP Equation
  let minimizedSOP = '0';
  if (minterms.length === numRows * numCols) {
    minimizedSOP = '1';
  } else if (groups.length > 0) {
    minimizedSOP = groups.map((g) => g.term).join(' + ');
  }

  // Derive Minimized POS Equation
  let minimizedPOS = '1';
  if (maxterms.length === numRows * numCols) {
    minimizedPOS = '0';
  } else if (maxterms.length === 0) {
    minimizedPOS = '1';
  } else {
    minimizedPOS = `ΠM(${maxterms.join(', ')})`;
  }

  // Calculate Standard SOP Gate Count:
  // NOT gates for complemented literals + AND gates for product terms + 1 OR gate
  let standardGateCount = 0;
  if (minterms.length > 0 && minterms.length < numRows * numCols) {
    const termCount = groups.length;
    const notGateCount = varNames.length; // Approximate inverter pool
    const andGates = groups.filter((g) => g.term.length > 1).length;
    const orGate = termCount > 1 ? 1 : 0;
    standardGateCount = notGateCount + andGates + orGate;
  }

  // Detect Parity / XOR / XNOR
  const parityDetection = detectParityPattern(minterms, varNames);
  let xorOptimized = {
    hasPattern: false,
    isXOR: false,
    isXNOR: false,
    equation: minimizedSOP,
    gateCount: standardGateCount,
    savedGates: 0,
    savingsPercent: 0,
  };

  if (parityDetection) {
    // An n-input XOR is 1 gate (or n-1 cascading 2-input XORs)
    const xorGateCount = Math.max(1, varNames.length - 1);
    const saved = Math.max(0, standardGateCount - xorGateCount);
    const percent =
      standardGateCount > 0 ? Math.round((saved / standardGateCount) * 100) : 0;

    xorOptimized = {
      hasPattern: true,
      isXOR: parityDetection.isXOR,
      isXNOR: parityDetection.isXNOR,
      equation: parityDetection.expression,
      gateCount: xorGateCount,
      savedGates: saved,
      savingsPercent: percent,
    };
  }

  // Derive Universal NAND equation and metrics
  // Double negate SOP: ( (T1)' · (T2)' ... )'
  let universalNANDEquation = '0';
  let nandGateCount = 0;
  if (minterms.length === 0) {
    universalNANDEquation = '0';
  } else if (minterms.length === numRows * numCols) {
    universalNANDEquation = '1';
  } else if (groups.length === 1) {
    universalNANDEquation = `(${groups[0].term}' )'`;
    nandGateCount = 2;
  } else {
    const nandTerms = groups.map((g) => `(${g.term})'`);
    universalNANDEquation = `(${nandTerms.join(' · ')})'`;
    nandGateCount = groups.length + 1 + varNames.length;
  }
  const nandChips = Math.ceil(nandGateCount / 4); // 4 gates per 7400 DIP-14 IC

  // Derive Universal NOR equation and metrics
  let universalNOREquation = '0';
  let norGateCount = 0;
  if (maxterms.length === 0) {
    universalNOREquation = '1';
  } else if (maxterms.length === numRows * numCols) {
    universalNOREquation = '0';
  } else {
    universalNOREquation = `( (${varNames.join(' + ')})' + ... )'`;
    norGateCount = Math.max(2, groups.length + 2);
  }
  const norChips = Math.ceil(norGateCount / 4);

  return {
    variableCount: varCount,
    varNames,
    rowVarNames,
    colVarNames,
    rowHeaders: rowGray,
    colHeaders: colGray,
    grid,
    groups,
    minimizedSOP,
    minimizedPOS,
    minterms,
    maxterms,
    xorOptimized,
    universalNAND: {
      equation: universalNANDEquation,
      gateCount: nandGateCount,
      icChips: nandChips,
    },
    universalNOR: {
      equation: universalNOREquation,
      gateCount: norGateCount,
      icChips: norChips,
    },
    standardGateCount,
  };
}

/**
 * Finds prime implicants on K-Map grid with torus (wrap-around) support
 */
function findOptimalKMapGroups(
  grid: KMapCell[][],
  numRows: number,
  numCols: number,
  varNames: string[],
  varCount: number
): KMapGroup[] {
  const groups: KMapGroup[] = [];
  const coveredMinterms = new Set<number>();
  const totalMinterms = grid
    .flat()
    .filter((c) => c.value === 1)
    .map((c) => c.mintermIndex);

  if (totalMinterms.length === 0) return [];
  if (totalMinterms.length === numRows * numCols) {
    return [
      {
        id: 'group_all',
        color: GROUP_COLORS[0],
        cells: grid
          .flat()
          .map((c) => ({ row: c.row, col: c.col, minterm: c.mintermIndex })),
        term: '1',
        type: '1s',
        width: numCols,
        height: numRows,
        startRow: 0,
        startCol: 0,
      },
    ];
  }

  // Group candidate sizes in descending power of 2: [4x4, 4x2, 2x4, 4x1, 2x2, 1x4, 2x1, 1x2, 1x1]
  const allSizes: Array<[number, number]> = [
    [4, 4],
    [4, 2],
    [2, 4],
    [4, 1],
    [2, 2],
    [1, 4],
    [2, 1],
    [1, 2],
    [1, 1],
  ];
  const candidateSizes: Array<[number, number]> = allSizes.filter(
    ([h, w]) => h <= numRows && w <= numCols
  );

  let colorIdx = 0;

  for (const [h, w] of candidateSizes) {
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        // Collect cells for this window with wrap-around modulo
        const cells: {
          row: number;
          col: number;
          minterm: number;
          bin: string;
        }[] = [];
        let allOnes = true;

        for (let dr = 0; dr < h; dr++) {
          for (let dc = 0; dc < w; dc++) {
            const actualR = (r + dr) % numRows;
            const actualC = (c + dc) % numCols;
            const cell = grid[actualR][actualC];
            if (cell.value !== 1) {
              allOnes = false;
              break;
            }
            cells.push({
              row: actualR,
              col: actualC,
              minterm: cell.mintermIndex,
              bin: cell.binaryString,
            });
          }
          if (!allOnes) break;
        }

        if (allOnes && cells.length > 0) {
          // Check if this group covers at least ONE new minterm
          const hasUncovered = cells.some(
            (cell) => !coveredMinterms.has(cell.minterm)
          );
          if (hasUncovered) {
            cells.forEach((cell) => coveredMinterms.add(cell.minterm));
            const term = deriveTermFromBinaries(
              cells.map((c) => c.bin),
              varNames
            );

            groups.push({
              id: `group_${colorIdx}_${Date.now()}`,
              color: GROUP_COLORS[colorIdx % GROUP_COLORS.length],
              cells: cells.map((c) => ({
                row: c.row,
                col: c.col,
                minterm: c.minterm,
              })),
              term,
              type: '1s',
              width: w,
              height: h,
              startRow: r,
              startCol: c,
              isWrapAround: r + h > numRows || c + w > numCols,
            });

            colorIdx++;
          }
        }
      }
    }
  }

  return groups;
}

/**
 * Derives minimized algebraic product term from binary strings in a group
 */
function deriveTermFromBinaries(bins: string[], varNames: string[]): string {
  if (bins.length === 0) return '';
  const bitLen = bins[0].length;
  let term = '';

  for (let bit = 0; bit < bitLen; bit++) {
    const firstVal = bins[0][bit];
    const allSame = bins.every((b) => b[bit] === firstVal);

    if (allSame) {
      const varName = varNames[bit] || `X${bit}`;
      if (firstVal === '1') {
        term += varName;
      } else {
        term += `${varName}'`;
      }
    }
  }

  return term || '1';
}
