const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const app=fs.readFileSync('assets/brand-v04/app-v05.js','utf8').split('function render()')[0];
const original=require('./portfolio-content.cjs');
const baseline=cp.execFileSync('git',['show','58abed2778ccd610cfda7d1766c181fcb23bf370:assets/brand-v04/app-v05.js'],{encoding:'utf8'}).split('function render()')[0];
function render(src,language){const c={localStorage:{getItem:()=>language},document:{getElementById:()=>null}};vm.createContext(c);vm.runInContext(src+';globalThis.result={home:home(),company:company(),contact:contact(),research:research(),footer:footer()}',c);return c.result}
for(const language of ['ko','en']){
 const now=render(app,language),before=render(baseline,language);
 for(const name of ['home','company','contact','footer'])assert.equal(now[name],before[name],`${language}: approved ${name} unchanged`);
 assert.equal((now.research.match(/<details class="research-deep-dive" open>/g)||[]).length,5);
 for(const d of original)for(const key of ['question','intro','problem','solution','value','next']){
  const text=language==='ko'?d[key][1].replace(/\.(?=\s|$)/g,''):d[key][0];
  assert.ok(now.research.includes(text),`${language}: ${d.id} ${key} restored`);
 }
 const withoutDetails=now.research.replace(/<details class="research-deep-dive" open>[\s\S]*?<\/details>/g,'');
 assert.equal(withoutDetails,before.research,`${language}: research summaries and structure unchanged`);
}
console.log('PASS: five detailed areas restored in KO/EN; approved main, company, contact, footer and research summaries unchanged');
