import test from 'node:test';
import assert from 'node:assert/strict';
import {economics,readiness,checks,prerequisites,validatePlan,safeUrl} from '../lib/launch/model.mjs';
const full={price:20000,customer_shipping:0,purchase:10000,shipping:3000,fee:2200,discount:1000,ad:500,claims:300};
test('all direct costs deducted; zero differs from unknown',()=>{
 assert.equal(economics(full).profit,3000);
 assert.equal(economics(full).prepay,13000);
 for(const invalid of ['',null,undefined,-1,'oops',Infinity])assert.equal(economics({...full,fee:invalid}).profit,null);
 assert.equal(economics({...full,fee:0}).profit,5200);
});
test('positive profit alone never marks a product ready',()=>{
 assert.equal(readiness(full).ready,false);
 const d={...full,source_url:'https://example.com/product',spec:'사과 2kg',evidence:'9/28 공급조건 확인',checks:Object.fromEntries(checks.map(([k])=>[k,true]))};
 const p=prerequisites.map(([key])=>({key,status:'ready'}));
 assert.equal(readiness(d,p).ready,true);
 assert.equal(readiness({...d,price:1000},p).ready,false);
 assert.equal(readiness(d,p.slice(1)).ready,false);
});
test('unsafe URL and unsupported completion claims are rejected',()=>{
 assert.equal(safeUrl('javascript:alert(1)'),null);
 assert.equal(safeUrl('https://user:password@example.com'),null);
 const form=new FormData();form.set('name','상품');form.set('source_url','https://example.com');form.set('channel','on');
 assert.throws(()=>validatePlan(form),/근거/);form.set('evidence','확인 기록');assert.equal(validatePlan(form).purchase,null);
 form.set('purchase','-1');assert.throws(()=>validatePlan(form),/0 이상/);
});
