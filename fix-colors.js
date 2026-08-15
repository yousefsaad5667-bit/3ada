const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixColors(filePath) {
  if (!filePath.endsWith('.scss')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace text variables
  content = content.replace(/var\(--text-primary(.*?)\)/g, 'var(--color-text-primary$1)');
  content = content.replace(/var\(--text-secondary(.*?)\)/g, 'var(--color-text-secondary$1)');
  content = content.replace(/var\(--text-muted(.*?)\)/g, 'var(--color-text-muted$1)');
  content = content.replace(/var\(--text-color(?!-)(.*?)\)/g, 'var(--color-text-primary$1)');
  content = content.replace(/var\(--text-color-secondary(.*?)\)/g, 'var(--color-text-secondary$1)');

  // Note: we can also strip the entire @media (prefers-color-scheme: dark) { ... } block
  // because it hardcodes dark mode colors based on OS preference rather than the theme toggle.
  const mediaQueryRegex = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[\s\S]*?\n\}\n/g;
  content = content.replace(mediaQueryRegex, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

walkDir('src/app', fixColors);
