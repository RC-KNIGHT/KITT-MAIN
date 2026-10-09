/**
 * KITT AI token alignment: hairline borders from the design system, flat elevation.
 * Usage: node scripts/kitt-ai-tokens.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src', 'components', 'kitt-ai');

const REPLACEMENTS = [
  // borders -> hairline / neutral tokens
  [/border-\[#FFFFFF\]\/1[05]/g, 'border-[#29292A]'],
  [/border-\[#FFFFFF\]\/(?:20|25|30|35)/g, 'border-[#353536]'],
  [/border-\[#FFFFFF\]\/(?:40|50|60)/g, 'border-[#8F8F8F]'],
  [/border-white\/10/g, 'border-[#29292A]'],
  [/border-white\/15/g, 'border-[#353536]'],
  [/divide-white\/\[0\.06\]/g, 'divide-[#29292A]'],
  // flat elevation
  [/\s?shadow-2xl\b/g, ''],
  [/\s?shadow-xl\b/g, ''],
  [/\s?shadow-lg\b/g, ''],
  [/\s?shadow-md\b/g, ''],
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

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;
  for (const [re, to] of REPLACEMENTS) next = next.replace(re, to);
  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    touched++;
  }
}

console.log(`Aligned tokens in ${touched} of ${files.length} KITT AI files.`);
