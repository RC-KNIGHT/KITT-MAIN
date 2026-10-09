/**
 * Neutralize decorative accent hues (teal / cyan / sky / purple / violet / orange)
 * and blue-tinted dark surfaces across src.
 * Semantic status tones (success green, error red, warning amber, info blue) stay
 * functional; everything decorative collapses onto the neutral ramp.
 * Usage: node scripts/theme-accents.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');

const DECORATIVE_HEX = {
  '#2dd4bf': '#B4B4B4', // teal-400
  '#22d3ee': '#B4B4B4', // cyan-400
  '#06b6d4': '#8F8F8F', // cyan-500
  '#0ea5e9': '#8F8F8F', // sky-500
  '#38bdf8': '#B4B4B4', // sky-400
  '#60a5fa': '#B4B4B4', // blue-400
  '#a855f7': '#CCCCCC', // purple-500
  '#c084fc': '#CCCCCC', // purple-400
  '#8b5cf6': '#8F8F8F', // violet-500
  '#9333ea': '#8F8F8F', // purple-600
  '#f97316': '#CCCCCC', // orange-500
  // blue-tinted dark surfaces / tints
  '#78350f': '#29292A',
  '#14532d': '#1D1D1E',
  '#0f3d2e': '#1D1D1E',
  '#0e3827': '#1D1D1E',
  '#1c0c0e': '#1D1D1E',
  '#15232c': '#141415',
  '#15232e': '#141415',
  '#12202a': '#141415',
  '#121f28': '#141415',
  '#0a1117': '#0B0B0C',
  '#0a1116': '#0B0B0C',
  '#091014': '#0B0B0C',
  '#070c10': '#0B0B0C',
  '#060a0e': '#0B0B0C',
  '#111f29': '#1D1D1E',
};

const DECORATIVE_RGBA = {
  'rgba(45,212,191': 'rgba(180,180,180',
  'rgba(45, 212, 191': 'rgba(180, 180, 180',
  'rgba(34,211,238': 'rgba(180,180,180',
  'rgba(34, 211, 238': 'rgba(180, 180, 180',
  'rgba(6,182,212': 'rgba(143,143,143',
  'rgba(6, 182, 212': 'rgba(143, 143, 143',
  'rgba(56,189,248': 'rgba(180,180,180',
  'rgba(56, 189, 248': 'rgba(180, 180, 180',
  'rgba(96,165,250': 'rgba(180,180,180',
  'rgba(96, 165, 250': 'rgba(180, 180, 180',
  'rgba(168,85,247': 'rgba(204,204,204',
  'rgba(168, 85, 247': 'rgba(204, 204, 204',
  'rgba(192,132,252': 'rgba(204,204,204',
  'rgba(192, 132, 252': 'rgba(204, 204, 204',
  'rgba(139,92,246': 'rgba(143,143,143',
  'rgba(139, 92, 246': 'rgba(143, 143, 143',
};

// Tailwind utility hues that read as decorative teal/cyan/purple/orange.
const CLASS_MAP = [
  [/-(teal|cyan|sky|violet|purple|orange|indigo|fuchsia|pink)-(50|100|200|300|400|500|600|700|800|900)\b/g, '-zinc-$2'],
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|css)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let touched = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;

  for (const [from, to] of Object.entries(DECORATIVE_HEX)) {
    next = next.replace(new RegExp(from, 'gi'), to);
  }
  for (const [from, to] of Object.entries(DECORATIVE_RGBA)) {
    next = next.split(from).join(to);
  }
  for (const [re, to] of CLASS_MAP) {
    next = next.replace(re, to);
  }

  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    touched++;
  }
}

console.log(`Neutralized decorative accents in ${touched} of ${files.length} files.`);
