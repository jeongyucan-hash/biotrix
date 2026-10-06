import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
// QA_LOG: approved v04/CI v0.3 release. Science and Programs remain legacy pages.
const systems = [
  {pages: ['index', 'company', 'research', 'contact'], css: 'assets/brand-v04/style.css',
    logo: 'assets/brand-v04/assets/logo-white-v03.svg', selector: '.brand img',
    viewBox: '30 55 837 210'},
  {pages: ['science', 'programs'], css: 'assets/portfolio.css',
    logo: 'assets/biotrix-wordmark-primary.svg', selector: '.brand img',
    viewBox: '0 0 590 152'},
];
for (const {pages, css, logo, selector, viewBox} of systems) {
  assert.ok(read(css).includes(selector), `${css} styles the complete brand image`);
  const svg = read(logo);
  assert.ok(svg.includes(`viewBox="${viewBox}"`), `${logo} preserves the lockup canvas`);
  assert.ok(svg.includes('<path') && !/<text\b/i.test(svg), `${logo} uses outlined lettering`);
  for (const page of pages) {
    const html = read(`${page}.html`);
    const links = html.match(/<link\b[^>]*>/gi) || [];
    const images = html.match(/<img\b[^>]*>/gi) || [];
    assert.ok(links.some(tag => /\brel=["']stylesheet["']/.test(tag) &&
      tag.includes(`/${css}`)), `${page} uses its approved brand stylesheet`);
    assert.ok(images.some(tag => tag.includes(`/${logo}`)), `${page} uses its complete outlined wordmark`);
    assert.ok(!html.includes('<span>BIOTRIX</span>'), `${page} has no extra typed wordmark`);
  }
}
const master = read('brand/BIOTRIX-master-v0.3.svg');
const reverse = read('assets/brand-v04/assets/logo-white-v03.svg');
assert.equal(reverse.replaceAll('#FFFFFF', '#073E35'), master, 'v04 reverse retains CI v0.3 master geometry');
console.log('PASS: approved v04 lockups across four current pages and preserved lockups across two legacy pages.');
