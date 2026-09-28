import test from 'node:test';
import assert from 'node:assert/strict';
import {dispatch,mailReady,validateDraft,validateQuote} from '../lib/sourcing/outreach.mjs';
const env={HQ_MAIL_ENABLED:'true',HQ_MAIL_FROM:'andrew@biotrix.co.kr',RESEND_API_KEY:'fixture-not-a-real-key'};
const row={id:'test',version:1,recipient:'vendor@example.com',subject:'견적',body:'조건 문의'};
test('unconfigured or different sender never calls provider',async()=>{
 let calls=0;assert.equal(mailReady({...env,HQ_MAIL_FROM:'someone@gmail.com'}),false);
 assert.equal((await dispatch(row,{env:{},fetcher:()=>{calls++;}})).status,'failed');assert.equal(calls,0);
});
test('acceptance records ID; only fixed provider and sender; idempotency key stable',async()=>{
 const result=await dispatch(row,{env,fetcher:async(url,opts)=>{assert.equal(url,'https://api.resend.com/emails');assert.equal(opts.headers['Idempotency-Key'],'hq-sourcing-test-v1');const body=JSON.parse(opts.body);assert.deepEqual(body.to,['vendor@example.com']);assert.equal(body.reply_to,'andrew@biotrix.co.kr');return {ok:true,json:async()=>({id:'fixture-accepted'})};}});assert.deepEqual(result,{status:'accepted',provider_id:'fixture-accepted'});
});
test('ambiguous network/server outcomes do not claim failure or retry',async()=>{
 let calls=0;const result=await dispatch(row,{env,fetcher:async()=>{calls++;throw Error('timeout');}});assert.equal(result.status,'unknown');assert.equal(calls,1);
 assert.equal((await dispatch(row,{env,fetcher:async()=>({ok:false,status:503})})).status,'unknown');
 assert.equal((await dispatch(row,{env,fetcher:async()=>({ok:false,status:403})})).status,'failed');
});
test('header injection rejected, zero and unknown quote costs distinct',()=>{
 const f=new FormData();f.set('recipient','a@example.com\r\nBcc:x@example.com');f.set('subject','견적');f.set('body','문의');assert.throws(()=>validateDraft(f));f.set('recipient','a@example.com');f.set('subject','test\nBcc:other');assert.throws(()=>validateDraft(f));
 const q=new FormData();q.set('spec','2kg');q.set('evidence','2026-09-28 이메일');q.set('reply','배송비 포함');q.set('shipping','0');const data=validateQuote(q);assert.equal(data.purchase,null);assert.equal(data.shipping,0);q.set('purchase','-1');assert.throws(()=>validateQuote(q));
});
