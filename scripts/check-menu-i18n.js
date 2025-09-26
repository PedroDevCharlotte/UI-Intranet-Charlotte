const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const menuDir = path.join(root, 'src', 'menu-items');
const localesPath = path.join(root, 'src', 'utils', 'locales', 'es.json');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error('Failed reading', p, e); return {}; }
}
const es = readJson(localesPath);
const esKeys = new Set(Object.keys(es));

function walkMenu() {
  const files = fs.readdirSync(menuDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx'));
  const found = new Map();
  for (const f of files) {
    const full = path.join(menuDir, f);
    const txt = fs.readFileSync(full, 'utf8');
    // regex to find title: '...' or title: "..." and caption: '...'
    const titleRegex = /title\s*:\s*['\"]([^'\"]+)['\"]/g;
    const captionRegex = /caption\s*:\s*['\"]([^'\"]+)['\"]/g;
    let m;
    while ((m = titleRegex.exec(txt)) !== null) {
      const id = m[1];
      if (!found.has(id)) found.set(id, new Set());
      found.get(id).add(`${full}`);
    }
    while ((m = captionRegex.exec(txt)) !== null) {
      const id = m[1];
      if (!found.has(id)) found.set(id, new Set());
      found.get(id).add(`${full}`);
    }
  }
  return Object.fromEntries(Array.from(found.entries()).map(([k,v])=>[k, Array.from(v)]));
}

const titles = walkMenu();
const titlesList = Object.keys(titles).sort();
const missing = titlesList.filter(t => !esKeys.has(t));

console.log(JSON.stringify({ totalTitles: titlesList.length, titles: titlesList, missingCount: missing.length, missing, locations: titles }, null, 2));
