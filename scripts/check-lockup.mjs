import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const css=readFileSync(new URL('../assets/brand-system.css',import.meta.url),'utf8');
assert.ok(css.includes('.brand .brand-wordmark'));
for(const page of ['index','company','science','programs','contact']) {
  const html=readFileSync(new URL(`../${page}.html`,import.meta.url),'utf8');
  assert.ok(html.includes('assets/brand-system.css'),`${page} uses shared brand stylesheet`);
  assert.ok(html.includes('assets/biotrix-wordmark-reverse.svg'),`${page} uses complete outlined wordmark`);
  assert.ok(!html.includes('<span>BIOTRIX</span>'),`${page} has no extra typed wordmark`);
}
console.log('PASS: complete ribbon wordmark across five biotech pages.');
