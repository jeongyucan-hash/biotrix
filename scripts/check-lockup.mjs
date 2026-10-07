import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const master=read('brand/BIOTRIX-master-v0.5.svg');
for(const color of ['green','white']){
 const svg=read(`assets/brand-v04/assets/logo-${color}-v05.svg`);
 assert.ok(svg.includes('viewBox="30 80 837 195"'));
 assert.ok(svg.includes('<path')&&!/<text\b/i.test(svg));
 assert.equal(svg.replaceAll('#FFFFFF','#073E35'),master,'master geometry is unchanged');
}
for(const page of ['index','company','research','contact','privacy','terms']){
 const html=read(page+'.html');assert.ok(html.includes('/assets/brand-v04/assets/logo-white-v05.svg'));
 assert.ok(html.includes('/assets/brand-v04/assets/logo-green-v05.svg'));
 assert.ok(html.includes('/assets/brand-v04/audit-v05.css'));
 assert.ok(html.includes('andrew@biotrix.co.kr'));
 assert.ok(!html.includes('contact@biotrix.co.kr'));
}
const redirects=JSON.parse(read('vercel.json')).redirects;
for(const path of ['/science','/programs'])assert.ok(redirects.some(x=>x.source===path&&x.destination==='/research'&&x.permanent));
console.log('PASS: six pages share the unchanged v0.5 vector master, contact and stylesheet; legacy routes redirect');
