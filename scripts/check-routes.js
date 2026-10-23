const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      getFiles(full, files);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = getFiles('src');
const routes = new Set();
const regexes = [
  /href=["'](\/[^"'#?]*)["']/g,
  /href:\s*["'](\/[^"'#?]*)["']/g,
  /push\(["'](\/[^"'#?]*)["']\)/g,
  /redirect\(["'](\/[^"'#?]*)["']\)/g,
  /path:\s*["'](\/[^"'#?]*)["']/g,
  /url:\s*["'](\/[^"'#?]*)["']/g
];

for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  for (const regex of regexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      let h = match[1];
      if (h && h.startsWith('/') && !h.startsWith('/api') && !h.startsWith('/_next') && !h.endsWith('.svg') && !h.endsWith('.png') && !h.endsWith('.ico')) {
        routes.add(h);
      }
    }
  }
}

console.log('--- ALL FRONTEND ROUTES IN CODE ---');
const sortedRoutes = Array.from(routes).sort();
const missing = [];
for (const h of sortedRoutes) {
  let targetPath = path.join('src', 'app', h, 'page.tsx');
  let exists = fs.existsSync(targetPath);
  if (!exists) {
    let parts = h.split('/').filter(Boolean);
    let checkDynamic = true;
    let cur = path.join('src', 'app');
    for (const part of parts) {
      if (fs.existsSync(path.join(cur, part))) {
        cur = path.join(cur, part);
      } else {
        let sub = fs.existsSync(cur) ? fs.readdirSync(cur).find(d => d.startsWith('[') && d.endsWith(']')) : null;
        if (sub) {
          cur = path.join(cur, sub);
        } else {
          checkDynamic = false;
          break;
        }
      }
    }
    if (checkDynamic && fs.existsSync(path.join(cur, 'page.tsx'))) {
      exists = true;
    }
  }
  if (!exists) {
    missing.push(h);
    console.log('[MISSING 404] ' + h);
  } else {
    console.log('[OK] ' + h);
  }
}
console.log('\nTotal Missing Routes:', missing.length);

