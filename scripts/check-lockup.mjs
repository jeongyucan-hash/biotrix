import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const css=readFileSync(new URL('../assets/editorial.css',import.meta.url),'utf8');
assert.match(css,/\.brand\{display:inline-flex;align-items:center;gap:4px;/);
assert.match(css,/\.brand img\{width:32px;height:36px;object-fit:contain\}/);
assert.match(css,/\.brand img\{width:28px;height:32px\}/);
for(const page of ['index','company','business','products','partnership','contact']) {
  const html=readFileSync(new URL(`../${page}.html`,import.meta.url),'utf8');
  assert.ok(html.includes('assets/editorial.css'),`${page} uses shared stylesheet`);
}
console.log('PASS: compact 4px lockup across six brand pages; both responsive icon sizes preserved.');
