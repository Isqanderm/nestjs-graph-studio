#!/usr/bin/env node

/**
 * Copy UI build output to dist/ui
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'ui', 'dist');
const targetDir = path.join(__dirname, '..', 'dist', 'ui');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying UI build output...');
copyRecursive(sourceDir, targetDir);
console.log(`✓ UI copied to ${targetDir}`);

