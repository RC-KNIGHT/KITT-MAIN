#!/usr/bin/env node
/**
 * Build wrapper that keeps esbuild's scratch files inside the project.
 *
 * Why this exists
 * ---------------
 * `npm run build` can fail with:
 *
 *   [vite:esbuild-transpile] remove
 *   C:\Users\<you>\AppData\Local\Temp\esbuild-<hash>: Access is denied.
 *
 * Vite hands source files to esbuild, and esbuild writes each one to a
 * temporary file in the OS temp directory (honouring TEMP/TMP on Windows,
 * TMPDIR elsewhere). It then deletes that file. Antivirus real-time scanning
 * and cloud-sync clients such as OneDrive can still hold a handle on the file
 * at the moment esbuild tries to remove it, so the delete is refused and the
 * whole build aborts -- even though every one of the 2,211 modules had already
 * been transformed successfully.
 *
 * Redirecting the temp directory to a location inside the project fixes it,
 * because that path is excluded from OneDrive syncing (see .gitignore) and is
 * far less likely to be scanned mid-build.
 *
 * Usage:  npm run build:local
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const tempDir = path.join(projectRoot, '.build-temp');

fs.mkdirSync(tempDir, { recursive: true });

const buildSteps = [
  path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
  'build',
];

const serverBundleStep = [
  path.join(projectRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
  'server.ts',
  '--bundle',
  '--platform=node',
  '--format=cjs',
  '--packages=external',
  '--sourcemap',
  '--outfile=dist/server.cjs',
];

const env = {
  ...process.env,
  TEMP: tempDir,
  TMP: tempDir,
  TMPDIR: tempDir,
};

function run(label, [command, ...args]) {
  console.log(`\n> ${label}`);
  const result = spawnSync(process.execPath, [command, ...args], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Failed to start ${label}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`\n${label} failed with exit code ${result.status}.`);
    process.exit(result.status ?? 1);
  }
}

run('vite build', buildSteps);
run('esbuild server bundle', serverBundleStep);

console.log('\nBuild complete: dist/ + dist/server.cjs');
