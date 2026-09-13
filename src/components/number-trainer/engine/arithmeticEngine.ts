/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KITT Ecosystem — Sovereign Number System & Positional Arithmetic Engine
 * High-precision mathematical synthesis for Binary, Octal, and Hexadecimal.
 */

export type NumberBase = 2 | 8 | 16;
export type ArithmeticOp = 'add' | 'sub' | 'mul';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'extreme';

export const DIGIT_CHARS = '0123456789ABCDEF';

export const BASE_METADATA: Record<NumberBase, { name: string; prefix: string; radix: number; example: string }> = {
  2:  { name: 'Binary', prefix: '0b', radix: 2, example: '10110110' },
  8:  { name: 'Octal', prefix: '0o', radix: 8, example: '745' },
  16: { name: 'Hexadecimal', prefix: '0x', radix: 16, example: '1A4F' },
};

export const OP_METADATA: Record<ArithmeticOp, { name: string; symbol: string; verb: string }> = {
  add: { name: 'Addition', symbol: '+', verb: 'sum' },
  sub: { name: 'Subtraction', symbol: '−', verb: 'difference' },
  mul: { name: 'Multiplication', symbol: '×', verb: 'product' },
};

// Tuned digit counts per level to keep problems pedagogical and visually manageable
export const DIFFICULTY_DIGITS: Record<NumberBase, Record<DifficultyLevel, number>> = {
  2:  { easy: 4, medium: 8,  hard: 12, extreme: 16 },
  8:  { easy: 3, medium: 5,  hard: 8,  extreme: 10 },
  16: { easy: 2, medium: 4,  hard: 6,  extreme: 8 },
};

export interface ArithmeticProblem {
  id: string;
  base: NumberBase;
  op: ArithmeticOp;
  level: DifficultyLevel;
  operandA: string;
  operandB: string;
  correctAnswer: string;
  isNegative: boolean;
  carries: number[];  // carry/borrow into each column from right to left
  stepExplanations: string[];
}

export interface VerificationResult {
  isCorrect: boolean;
  userAnswerNormalized: string;
  correctAnswerNormalized: string;
  pointsEarned: number;
  accuracyMatches: boolean[];
}

export function digitValue(ch: string): number {
  const code = ch.toUpperCase().charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48; // '0'-'9'
  if (code >= 65 && code <= 70) return code - 55; // 'A'-'F'
  return 0;
}

export function digitChar(val: number): string {
  return DIGIT_CHARS[((val % 16) + 16) % 16];
}

export function randomDigits(base: NumberBase, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    // Avoid leading 0 for readability if length > 1
    if (i === 0 && length > 1) {
      out += digitChar(Math.floor(Math.random() * (base - 1)) + 1);
    } else {
      out += digitChar(Math.floor(Math.random() * base));
    }
  }
  return out;
}

/**
 * Adds two digit strings of equal length in the specified base.
 * Computes columnar carry-ins and step-by-step descriptions.
 */
export function addBaseNumbers(aStr: string, bStr: string, base: NumberBase) {
  const n = Math.max(aStr.length, bStr.length);
  const padA = aStr.padStart(n, '0');
  const padB = bStr.padStart(n, '0');

  const sumDigits: string[] = new Array(n + 1).fill('0');
  const carries: number[] = new Array(n + 1).fill(0);
  const steps: string[] = [];

  let carry = 0;
  for (let i = n - 1; i >= 0; i--) {
    const colIdx = n - 1 - i;
    const vA = digitValue(padA[i]);
    const vB = digitValue(padB[i]);
    const total = vA + vB + carry;
    const outDigit = total % base;
    const nextCarry = Math.floor(total / base);

    sumDigits[i + 1] = digitChar(outDigit);
    carries[colIdx] = carry;

    steps.push(
      `Column ${colIdx + 1} (from right): ${padA[i]} + ${padB[i]}${carry ? ` + ${carry} (carry)` : ''} = ${total} ` +
      `(in base ${base}: ${total.toString(base).toUpperCase()}). Write '${digitChar(outDigit)}'${nextCarry ? `, carry ${nextCarry}` : ''}.`
    );

    carry = nextCarry;
  }

  carries[n] = carry;
  sumDigits[0] = digitChar(carry);

  let finalSum = sumDigits.join('');
  if (finalSum.startsWith('0') && finalSum.length > 1) {
    finalSum = finalSum.slice(1);
  }

  return { sum: finalSum, carries, steps };
}

/**
 * Subtracts subtrahend from minuend in the specified base.
 */
export function subBaseNumbers(minuend: string, subtrahend: string, base: NumberBase) {
  const n = Math.max(minuend.length, subtrahend.length);
  const padA = minuend.padStart(n, '0');
  const padB = subtrahend.padStart(n, '0');

  const diffDigits: string[] = new Array(n).fill('0');
  const borrows: number[] = new Array(n).fill(0);
  const steps: string[] = [];

  let borrow = 0;
  for (let i = n - 1; i >= 0; i--) {
    const colIdx = n - 1 - i;
    let aVal = digitValue(padA[i]) - borrow;
    const bVal = digitValue(padB[i]);

    let nextBorrow = 0;
    if (aVal < bVal) {
      aVal += base;
      nextBorrow = 1;
    }

    const outDigit = aVal - bVal;
    diffDigits[i] = digitChar(outDigit);
    borrows[colIdx] = nextBorrow;

    steps.push(
      `Column ${colIdx + 1} (from right): ${padA[i]}${borrow ? ` − 1 (borrowed)` : ''} vs ${padB[i]}. ` +
      (nextBorrow ? `Needs borrow (+${base}): (${aVal} − ${bVal}) = ${outDigit}. Write '${digitChar(outDigit)}', borrow 1 from left.` :
       `Result: (${aVal} − ${bVal}) = ${outDigit}. Write '${digitChar(outDigit)}'.`)
    );

    borrow = nextBorrow;
  }

  let finalDiff = diffDigits.join('');
  // Strip non-essential leading zeros, but keep single 0
  finalDiff = finalDiff.replace(/^0+(?=[0-9A-F])/i, '');
  if (!finalDiff) finalDiff = '0';

  return { diff: finalDiff, borrows, steps };
}

/**
 * Multiplies two numbers in the specified base using BigInt.
 */
export function mulBaseNumbers(aStr: string, bStr: string, base: NumberBase) {
  try {
    const cleanA = aStr.trim() || '0';
    const cleanB = bStr.trim() || '0';
    const prefix = base === 2 ? '0b' : base === 8 ? '0o' : '0x';
    const valA = BigInt(`${prefix}${cleanA}`);
    const valB = BigInt(`${prefix}${cleanB}`);
    const productVal = valA * valB;
    const productStr = productVal.toString(base).toUpperCase();

    const steps = [
      `Convert ${cleanA} (base ${base}) to decimal: ${valA.toString(10)}`,
      `Convert ${cleanB} (base ${base}) to decimal: ${valB.toString(10)}`,
      `Multiply: ${valA.toString(10)} × ${valB.toString(10)} = ${productVal.toString(10)}`,
      `Convert decimal product back to Base ${base}: ${productStr}`,
    ];

    return { product: productStr, carries: [], steps };
  } catch {
    return { product: '0', carries: [], steps: ['Calculation error encountered.'] };
  }
}

/**
 * Generates an arithmetic question with correct answer and columnar hints.
 */
export function generateArithmeticProblem(
  base: NumberBase,
  op: ArithmeticOp,
  level: DifficultyLevel,
  allowNegative: boolean = false
): ArithmeticProblem {
  const digitCount = DIFFICULTY_DIGITS[base][level];
  const id = 'drill_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  if (op === 'add') {
    const a = randomDigits(base, digitCount);
    const b = randomDigits(base, digitCount);
    const { sum, carries, steps } = addBaseNumbers(a, b, base);

    return {
      id,
      base,
      op,
      level,
      operandA: a,
      operandB: b,
      correctAnswer: sum,
      isNegative: false,
      carries,
      stepExplanations: steps,
    };
  }

  if (op === 'sub') {
    let a = randomDigits(base, digitCount);
    let b = randomDigits(base, digitCount);

    const valA = BigInt(`0${base === 2 ? 'b' : base === 8 ? 'o' : 'x'}${a}`);
    const valB = BigInt(`0${base === 2 ? 'b' : base === 8 ? 'o' : 'x'}${b}`);

    let isNegative = false;
    if (!allowNegative && valA < valB) {
      const temp = a;
      a = b;
      b = temp;
    } else if (valA < valB) {
      isNegative = true;
    }

    const minuend = isNegative ? b : a;
    const subtrahend = isNegative ? a : b;
    const { diff, borrows, steps } = subBaseNumbers(minuend, subtrahend, base);

    return {
      id,
      base,
      op,
      level,
      operandA: a,
      operandB: b,
      correctAnswer: (isNegative ? '-' : '') + diff,
      isNegative,
      carries: borrows,
      stepExplanations: steps,
    };
  }

  const mulDigits = Math.max(2, Math.floor(digitCount / 2));
  const a = randomDigits(base, mulDigits);
  const b = randomDigits(base, Math.max(1, mulDigits - 1));
  const { product, steps } = mulBaseNumbers(a, b, base);

  return {
    id,
    base,
    op,
    level,
    operandA: a,
    operandB: b,
    correctAnswer: product,
    isNegative: false,
    carries: [],
    stepExplanations: steps,
  };
}

/**
 * Normalizes user answer strings (stripping leading zeros, trimming, uppercase).
 */
export function normalizeAnswer(ans: string): string {
  if (!ans) return '';
  let s = ans.trim().toUpperCase().replace(/\s+/g, '');
  let sign = '';
  if (s.startsWith('-')) {
    sign = '-';
    s = s.slice(1);
  } else if (s.startsWith('+')) {
    s = s.slice(1);
  }
  s = s.replace(/^0+(?=[0-9A-F])/i, '');
  if (!s) s = '0';
  return sign + s;
}

/**
 * Verifies user answer against correct answer.
 */
export function verifyAnswer(userAns: string, problem: ArithmeticProblem): VerificationResult {
  const userNorm = normalizeAnswer(userAns);
  const correctNorm = normalizeAnswer(problem.correctAnswer);
  const isCorrect = userNorm !== '' && userNorm === correctNorm;

  const basePoints = problem.level === 'extreme' ? 60 : problem.level === 'hard' ? 45 : problem.level === 'medium' ? 30 : 15;
  const pointsEarned = isCorrect ? basePoints : 0;

  const revUser = userNorm.split('').reverse();
  const revCorrect = correctNorm.split('').reverse();
  const accuracyMatches = revCorrect.map((char, i) => revUser[i] === char);

  return {
    isCorrect,
    userAnswerNormalized: userNorm,
    correctAnswerNormalized: correctNorm,
    pointsEarned,
    accuracyMatches,
  };
}

/**
 * Converts any numeric input across all 4 standard computer architecture bases:
 * Binary (2), Octal (8), Decimal (10), Hexadecimal (16).
 */
export function convertBases(inputVal: string, sourceBase: 2 | 8 | 10 | 16) {
  const clean = inputVal.trim();
  if (!clean) {
    return { bin: '0', oct: '0', dec: '0', hex: '0', isValid: false, bits: new Array(16).fill(0) };
  }

  try {
    let bigNum: bigint;
    if (sourceBase === 2) bigNum = BigInt(`0b${clean}`);
    else if (sourceBase === 8) bigNum = BigInt(`0o${clean}`);
    else if (sourceBase === 10) bigNum = BigInt(clean);
    else bigNum = BigInt(`0x${clean}`);

    const bin = bigNum.toString(2);
    const oct = bigNum.toString(8);
    const dec = bigNum.toString(10);
    const hex = bigNum.toString(16).toUpperCase();

    // 16-bit register array
    const bits: number[] = [];
    const padBin = bin.padStart(16, '0').slice(-16);
    for (let i = 0; i < 16; i++) {
      bits.push(padBin[i] === '1' ? 1 : 0);
    }

    return { bin, oct, dec, hex, isValid: true, bits };
  } catch (_) {
    return { bin: 'Invalid', oct: 'Invalid', dec: 'Invalid', hex: 'Invalid', isValid: false, bits: new Array(16).fill(0) };
  }
}
