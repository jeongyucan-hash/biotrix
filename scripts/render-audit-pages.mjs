// Execute the deployed v04 renderer for static content auditing, without a browser.
// This checks generated markup; it does not claim layout or browser interaction QA.
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const script = read('assets/brand-v04/app-ci-v03.js');
const result = {};
for (const [page, pathname] of [['index', '/'], ['company', '/company'], ['research', '/research'], ['contact', '/contact']]) {
  result[page] = {};
  for (const language of ['en', 'ko']) {
    const nodes = Object.fromEntries(['nav', 'main', 'footer', 'header', '.lang', '.menu'].map(name => [name, {
      innerHTML: '', classList: {toggle() {}, remove() {}}, setAttribute() {},
    }]));
    const document = {
      documentElement: {}, body: {classList: {toggle() {}}},
      querySelector(selector) {assert.ok(nodes[selector], `Unsupported selector: ${selector}`); return nodes[selector];},
      addEventListener() {},
    };
    runInNewContext(script, {
      document, location: {pathname, hash: ''},
      localStorage: {getItem: () => language}, window: {addEventListener() {}},
    }, {filename: 'app-ci-v03.js', timeout: 1000});
    for (const selector of ['nav', 'main', 'footer']) assert.ok(nodes[selector].innerHTML, `${page}/${language}: ${selector} rendered`);
    assert.equal(document.documentElement.lang, language);
    let html = read(`${page}.html`);
    for (const tag of ['nav', 'main', 'footer']) {
      html = html.replace(new RegExp(`(<${tag}\\b[^>]*>)[\\s\\S]*?(</${tag}>)`), (_, open, close) => open + nodes[tag].innerHTML + close);
    }
    result[page][language] = html;
  }
}
console.log(JSON.stringify(result));
