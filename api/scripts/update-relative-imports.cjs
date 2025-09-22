const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const allowedExtensions = new Set(['.js', '.cjs', '.mjs', '.json', '.node']);
const tsExtension = '.ts';

/**
 * Recursively gather .ts files under the src directory (exclude declaration files).
 */
function gatherTsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...gatherTsFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(tsExtension) && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function needsJsExtension(specifier) {
  if (!specifier.startsWith('.')) {
    return false;
  }

  if (allowedExtensions.has(path.extname(specifier))) {
    return false;
  }

  // Skip paths ending with '/' to avoid invalid specifiers.
  if (specifier.endsWith('/')) {
    return false;
  }

  return true;
}

function transformSpecifiers(content) {
  let updated = content;
  const pattern = /(from\s+['"])(\.\.?(?:\/[\w.-]+)*)(['"])/g;
  const dynamicPattern = /(import\(\s*['"])(\.\.?(?:\/[\w.-]+)*)(['"]\s*\))/g;

  const replaceCallback = (_, prefix, specifier, suffix) => {
    if (needsJsExtension(specifier)) {
      return `${prefix}${specifier}.js${suffix}`;
    }
    return `${prefix}${specifier}${suffix}`;
  };

  updated = updated.replace(pattern, replaceCallback);
  updated = updated.replace(dynamicPattern, replaceCallback);

  return updated;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const transformed = transformSpecifiers(original);

  if (transformed !== original) {
    fs.writeFileSync(filePath, transformed);
  }
}

for (const file of gatherTsFiles(srcDir)) {
  processFile(file);
}
