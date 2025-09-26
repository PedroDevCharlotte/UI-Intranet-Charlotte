const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const localesPath = path.join(root, 'src', 'utils', 'locales', 'es.json');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error('Failed reading', p, e); return {}; }
}

const es = readJson(localesPath);
const esKeys = new Set(Object.keys(es));

const exts = ['.ts', '.tsx', '.js', '.jsx'];
const codeDir = path.join(root, 'src');

const formattedMsgRegex = /<FormattedMessage\s+id=\"([^\"]+)\"/g;
const formattedMsgRegex2 = /<FormattedMessage\s+id=\'([^\']+)\'/g;
const intlRegex = /intl\.formatMessage\(\{\s*id:\s*['\"]([^'\"]+)['\"]\s*\}\)/g;
const idRegexGeneric = /FormattedMessage\s+id=\"([^\"]+)\"|FormattedMessage\s+id=\'([^\']+)\'|intl\.formatMessage\(\{\s*id:\s*['\"]([^'\"]+)['\"]\s*\}\)/g;

const used = new Map(); // id -> Set of file:line

function walk(dir) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      walk(full);
    } else {
      if (!exts.includes(path.extname(entry.name))) continue;
      const txt = fs.readFileSync(full, 'utf8');
      const lines = txt.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let m;
        while ((m = idRegexGeneric.exec(line)) !== null) {
          const id = m[1] || m[2] || m[3];
          if (!id) continue;
          if (!used.has(id)) used.set(id, new Set());
          used.get(id).add(`${full}:${i+1}`);
        }
      }
    }
  }
}

walk(codeDir);

const usedIds = Array.from(used.keys()).sort();
const missing = usedIds.filter(id => !esKeys.has(id));

console.log(JSON.stringify({ totalUsed: usedIds.length, usedIds, missingCount: missing.length, missing, locations: Object.fromEntries(Array.from(used.entries()).map(([k,v])=>[k, Array.from(v).slice(0,10)])) }, null, 2));
