/**
 * Collapse success (emerald/green) and informational (blue/sky) tones onto the
 * neutral monochrome ramp. Error (red) and warning (amber) semantics are kept.
 * Usage: node scripts/theme-status.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');

const HEX = {
  '#10b981': '#F5F5F5',
  '#22c55e': '#F5F5F5',
  '#34d399': '#E8E8E8',
  '#059669': '#E8E8E8',
  '#16a34a': '#E8E8E8',
  '#065f46': '#29292A',
  '#3b82f6': '#B4B4B4',
  '#2563eb': '#8F8F8F',
  '#1d4ed8': '#737373',
  '#1e40af': '#353536',
};

const RGBA = {
  'rgba(16,185,129': 'rgba(245,245,245',
  'rgba(16, 185, 129': 'rgba(245, 245, 245',
  'rgba(34,197,94': 'rgba(245,245,245',
  'rgba(34, 197, 94': 'rgba(245, 245, 245',
  'rgba(52,211,153': 'rgba(232,232,232',
  'rgba(52, 211, 153': 'rgba(232, 232, 232',
  'rgba(59,130,246': 'rgba(180,180,180',
  'rgba(59, 130, 246': 'rgba(180, 180, 180',
  'rgba(37,99,235': 'rgba(143,143,143',
  'rgba(37, 99, 235': 'rgba(143, 143, 143',
};

const CLASS_HUES = 'emerald|green|blue|sky|indigo';

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

  for (const [from, to] of Object.entries(HEX)) {
    next = next.replace(new RegExp(from, 'gi'), to);
  }
  for (const [from, to] of Object.entries(RGBA)) {
    next = next.split(from).join(to);
  }
  next = next.replace(
    new RegExp(`-(${CLASS_HUES})-(50|100|200|300|400|500|600|700|800|900)\\b`, 'g'),
    '-zinc-$2'
  );

  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    touched++;
  }
}

console.log(`Neutralized success/info tones in ${touched} of ${files.length} files.`);
