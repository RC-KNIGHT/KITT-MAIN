/**
 * KITT AI portal design normalization:
 * - flat surfaces (no gradients on chrome, per DESIGN.md)
 * - no glow shadows on regular components
 * - border radius moved onto the design scale (6 / 8 / 10 / 12 / 24 / pill)
 * Usage: node scripts/kitt-ai-design.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src', 'components', 'kitt-ai');

// Gradient utilities -> flat solid surface (monochrome palette).
const GRADIENT_PATTERNS = [
  [/bg-gradient-to-r from-\[#FFFFFF\] via-\[[^\]]*\] to-\[[^\]]*\]/g, 'bg-[#FFFFFF]'],
  [/bg-gradient-to-(?:r|tr|br|t|b|l|tl|bl) from-\[#FFFFFF\] via-\[[^\]]*\] to-\[[^\]]*\]/g, 'bg-[#FFFFFF]'],
  [/bg-gradient-to-(?:r|tr|br|t|b|l|tl|bl) from-\[#FFFFFF\] to-\[#[0-9A-Fa-f]+\]/g, 'bg-[#FFFFFF]'],
  [/hover:from-\[[^\]]*\] hover:to-\[[^\]]*\]/g, 'hover:bg-[#E8E8E8]'],
  [/bg-gradient-to-(?:r|tr|br|t|b|l|tl|bl) from-\[#[0-9A-Fa-f]+\] via-\[[^\]]*\] to-\[#[0-9A-Fa-f]+\]/g, 'bg-[#1D1D1E]'],
  [/bg-gradient-to-(?:r|tr|br|t|b|l|tl|bl) from-\[#(?:141415|0B0B0C|0F0F10|[0-9A-Fa-f]+)\] to-\[#(?:141415|0B0B0C|0F0F10|[0-9A-Fa-f]+)\]/g, 'bg-[#1D1D1E]'],
];

// Glow / elevation shadows on regular components -> removed (flat depth model).
const SHADOW_PATTERNS = [
  [/\s?shadow-\[[^\]]*rgba\(255,\s*255,\s*255[^\]]*\]/g, ''],
  [/\s?shadow-\[[^\]]*rgba\(45,\s*212,\s*191[^\]]*\]/g, ''],
  [/\s?shadow-\[[^\]]*#[0-9A-Fa-f]{6}[^\]]*\]/g, ''],
  [/\s?shadow-inner\b/g, ''],
];

// Radius scale from the design system.
const RADIUS_PATTERNS = [
  [/\brounded-sm\b/g, 'rounded-[6px]'],
  [/\brounded-md\b/g, 'rounded-[10px]'],
  [/\brounded-lg\b/g, 'rounded-[12px]'],
  [/\brounded-xl\b/g, 'rounded-[12px]'],
  [/\brounded-2xl\b/g, 'rounded-[24px]'],
  [/\brounded-3xl\b/g, 'rounded-[24px]'],
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.tsx$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let touched = 0;
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;

  for (const [re, to] of GRADIENT_PATTERNS) next = next.replace(re, to);
  for (const [re, to] of SHADOW_PATTERNS) next = next.replace(re, to);
  for (const [re, to] of RADIUS_PATTERNS) next = next.replace(re, to);

  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    touched++;
    changed += 1;
  }
}

console.log(`Normalized design tokens in ${touched} of ${files.length} KITT AI files.`);
