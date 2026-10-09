/**
 * One-shot palette remap: surrealist gold/teal/obsidian -> monochrome neutral.
 * Black canvas (#000000), neutral surfaces/text from the supplied design tokens.
 * Usage: node scripts/theme-remap.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');

// Order matters: longer/more specific hexes first is unnecessary since all are 6-digit distinct.
const HEX_MAP = {
  '#a58d66': '#FFFFFF', // gold accent -> white (primary accent on black)
  '#e5e1dd': '#F5F5F5', // sand text -> text
  '#080f14': '#000000', // obsidian canvas -> black
  '#dfcca8': '#E8E8E8', // gold light -> neutral-2
  '#76b4c2': '#B4B4B4', // teal light -> neutral light
  '#407e8c': '#8F8F8F', // teal -> neutral-1
  '#8c7654': '#737373', // gold dark -> neutral dark
  '#bfa378': '#CCCCCC', // gold mid -> neutral
  '#fff8f0': '#FFFFFF',
  '#1e333d': '#353536', // scrollbar track zone -> border
  // dark surfaces -> neutral surface ramp
  '#0d171f': '#141415',
  '#0c161d': '#141415',
  '#0d161d': '#141415',
  '#0c161c': '#141415',
  '#0e171f': '#141415',
  '#11131a': '#141415',
  '#121c22': '#1D1D1E',
  '#12202b': '#1D1D1E',
  '#12222b': '#1D1D1E',
  '#111d24': '#1D1D1E',
  '#091116': '#0F0F10',
  '#070d12': '#0B0B0C',
  '#0d0d0f': '#0B0B0C',
  '#1d2c38': '#29292A',
};

const RGBA_MAP = {
  'rgba(165,141,102': 'rgba(255,255,255',
  'rgba(165, 141, 102': 'rgba(255, 255, 255',
  'rgba(64,126,140': 'rgba(143,143,143',
  'rgba(64, 126, 140': 'rgba(143, 143, 143',
  'rgba(223,204,168': 'rgba(232,232,232',
  'rgba(223, 204, 168': 'rgba(232, 232, 232',
  'rgba(118,180,194': 'rgba(180,180,180',
  'rgba(118, 180, 194': 'rgba(180, 180, 180',
  'rgba(229,225,221': 'rgba(245,245,245',
  'rgba(229, 225, 221': 'rgba(245, 245, 245',
  'rgba(8,15,20': 'rgba(0,0,0',
  'rgba(8, 15, 20': 'rgba(0, 0, 0',
  'rgba(7,8,12': 'rgba(0,0,0',
  'rgba(7, 8, 12': 'rgba(0, 0, 0',
  'rgba(3,20,29': 'rgba(0,0,0',
  'rgba(3, 20, 29': 'rgba(0, 0, 0',
  'rgba(2,14,21': 'rgba(0,0,0',
  'rgba(2, 14, 21': 'rgba(0, 0, 0',
  'rgba(6,11,15': 'rgba(0,0,0',
  'rgba(6, 11, 15': 'rgba(0, 0, 0',
  'rgba(13,23,31': 'rgba(29,29,30',
  'rgba(13, 23, 31': 'rgba(29, 29, 30',
  'rgba(13,23,30': 'rgba(29,29,30',
  'rgba(13, 23, 30': 'rgba(29, 29, 30',
  'rgba(8,58,79': 'rgba(29,29,30',
  'rgba(8, 58, 79': 'rgba(29, 29, 30',
  'rgba(6,34,47': 'rgba(20,20,21',
  'rgba(6, 34, 47': 'rgba(20, 20, 21',
  'rgba(16,29,36': 'rgba(29,29,30',
  'rgba(16, 29, 36': 'rgba(29, 29, 30',
  'rgba(9,16,21': 'rgba(10,10,11',
  'rgba(9, 16, 21': 'rgba(10, 10, 11',
  'rgba(24,32,36': 'rgba(32,32,33',
  'rgba(24, 32, 36': 'rgba(32, 32, 33',
  'rgba(11,17,21': 'rgba(10,10,11',
  'rgba(11, 17, 21': 'rgba(10, 10, 11',
  'rgba(29,44,56': 'rgba(41,41,42',
  'rgba(29, 44, 56': 'rgba(41, 41, 42',
  'rgba(15,23,42': 'rgba(15,15,16',
  'rgba(15, 23, 42': 'rgba(15, 15, 16',
  'rgba(30,41,59': 'rgba(30,30,31',
  'rgba(30, 41, 59': 'rgba(30, 30, 31',
  'rgba(51,65,85': 'rgba(53,53,54',
  'rgba(51, 65, 85': 'rgba(53, 53, 54',
};

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
let replacements = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;

  for (const [from, to] of Object.entries(HEX_MAP)) {
    const re = new RegExp(from.replace('#', '#'), 'gi');
    next = next.replace(re, to);
  }
  for (const [from, to] of Object.entries(RGBA_MAP)) {
    next = next.split(from).join(to);
  }

  if (next !== original) {
    const before = original.length;
    fs.writeFileSync(file, next, 'utf8');
    touched++;
    replacements += Math.abs(next.length - before) > 0 ? 1 : 0;
  }
}

console.log(`Remapped palette in ${touched} of ${files.length} files.`);
