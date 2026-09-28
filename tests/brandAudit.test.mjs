import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {auditBrand} from '../lib/learning/brandAudit.mjs';
const logo=Buffer.from('<svg viewBox="0 0 90 100"></svg>');const sha=createHash('sha256').update(logo).digest('hex');
const manifest={version:'3.2',files:[{name:'BIOTRIX_Logo_Negative_B.svg',bytes:logo.length,sha256:sha}]};
test('audit passes consistent master and detects tampering and mismatched public logo',()=>{
 const assets={'BIOTRIX_Logo_Negative_B.svg':logo};
 assert.equal(auditBrand({manifest,assets,site:{logo:logo.toString(),favicon:logo.toString(),css:':root{--ivory:#ffffff;}'}}).status,'pass');
 const r=auditBrand({manifest,assets:{'BIOTRIX_Logo_Negative_B.svg':Buffer.from('bad')},site:{logo:'different',favicon:'different',css:'--ivory:#f6f4ee'}});
 assert.equal(r.status,'fail');assert.ok(r.issues.some(x=>x.code==='ASSET_INTEGRITY'));assert.ok(r.issues.some(x=>x.code==='CANVAS_NOT_WHITE'));
});
