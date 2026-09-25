const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== 1. Configuring User Environment PATH ===');
try {
  const regOut = execSync('reg query HKCU\\Environment /v Path', { encoding: 'utf-8' });
  const m = regOut.match(/REG_\S+\s+(.*)/i);
  let currentPath = m ? m[1].trim() : '';
  const agy = 'C:\\Users\\om\\AppData\\Local\\agy\\bin';
  const code = 'C:\\Users\\om\\AppData\\Local\\Programs\\Microsoft VS Code\\bin';
  
  let paths = currentPath.split(';').filter(Boolean);
  let changed = false;
  if (!paths.includes(agy)) {
    paths.unshift(agy);
    changed = true;
  }
  if (!paths.includes(code)) {
    paths.unshift(code);
    changed = true;
  }
  if (changed) {
    const newPath = paths.join(';');
    execSync(`setx Path "${newPath}"`);
    console.log('Successfully added agy and code to User PATH!');
  } else {
    console.log('User PATH already contains agy and code.');
  }
} catch (err) {
  console.log('PATH config note:', err.message);
}

console.log('=== 2. Initializing Git Repository ===');
const projectDir = 'C:\\Users\\om\\.gemini\\antigravity\\scratch\\the-kit-ecosystem\\THE-KIT-ECOSYSTEM-main';
try {
  if (!fs.existsSync(path.join(projectDir, '.git'))) {
    execSync('git init', { cwd: projectDir, stdio: 'inherit' });
    execSync('git config user.name "Om Choubey"', { cwd: projectDir });
    execSync('git config user.email "om@kitt.ai"', { cwd: projectDir });
    execSync('git add .', { cwd: projectDir, stdio: 'inherit' });
    execSync('git commit -m "feat: complete KITT Ecosystem multi-platform portal with 3D constellation physics"', { cwd: projectDir, stdio: 'inherit' });
    console.log('Git repository initialized and committed!');
  } else {
    console.log('Git repository already initialized.');
  }
} catch (err) {
  console.log('Git setup note:', err.message);
}

console.log('=== 3. Launching Project in IDE ===');
try {
  const codeCmd = 'C:\\Users\\om\\AppData\\Local\\Programs\\Microsoft VS Code\\bin\\code.cmd';
  if (fs.existsSync(codeCmd)) {
    execSync(`"${codeCmd}" "${projectDir}"`, { stdio: 'inherit' });
    console.log('Successfully launched VS Code with project folder opened!');
  }
} catch (err) {
  console.log('IDE launch note:', err.message);
}

console.log('=== Environment Setup Complete ===');
