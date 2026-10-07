import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const script=read('assets/brand-v04/app-v05.js');const result={};
for(const [page,pathname] of [['index','/'],['company','/company'],['research','/research'],['contact','/contact'],['privacy','/privacy'],['terms','/terms']]){
 result[page]={};for(const language of ['en','ko']){
 const nodes=Object.fromEntries(['nav','main','footer','header','.lang','.menu','.skip','link[rel="canonical"]'].map(n=>[n,{innerHTML:'',classList:{toggle(){},remove(){}},setAttribute(){}}]));
 const document={documentElement:{},body:{classList:{toggle(){}}},getElementById:()=>({innerHTML:page==='privacy'||page==='terms'?read(`assets/brand-v04/${page}.html`):''}),querySelector:s=>nodes[s]||{setAttribute(){}},addEventListener(){}};
 runInNewContext(script,{document,location:{pathname,hash:''},localStorage:{getItem:()=>language},window:{addEventListener(){}}},{timeout:1000});
 assert.equal(document.documentElement.lang,language);assert.equal(nodes['link[rel="canonical"]'].href,'https://biotrix.co.kr'+pathname);
 let html=read(page+'.html');for(const tag of ['nav','main','footer'])html=html.replace(new RegExp(`(<${tag}\\b[^>]*>)[\\s\\S]*?(</${tag}>)`),(_,a,b)=>a+nodes[tag].innerHTML+b);
 html=html.replace(/<template\b[\s\S]*?<\/template>/g,'');result[page][language]=html;
 }
}
console.log(JSON.stringify(result));
