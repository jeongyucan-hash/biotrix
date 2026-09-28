import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {auditBrand} from '../lib/learning/brandAudit.mjs';

const hq=process.env.HQ_ROOT||process.cwd(), publicRoot=process.env.PUBLIC_ROOT;
const manifest=JSON.parse(await readFile(join(hq,'lib/design/manifest.json'),'utf8'));
const assets=Object.fromEntries(await Promise.all(manifest.files.map(async f=>[f.name,await readFile(join(hq,'design-assets',f.name)).catch(()=>null)])));
let site;
if(publicRoot){
 const read=(p)=>readFile(join(publicRoot,p),'utf8');
 site={logo:await read('assets/biotrix-symbol-flat.svg'),favicon:await read('favicon.svg'),css:await read('assets/editorial.css'),home:await read('index.html'),photos:await Promise.all(['food','wellness','beauty','brand'].map(n=>readFile(join(publicRoot,'assets',`editorial-${n}.webp`))))};
}
const report=auditBrand({manifest,assets,site});
const output=process.env.REPORT_PATH||join(hq,'brand-audit-report.json');
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,issues:report.issues,output}));
if(report.status==='fail')process.exitCode=1;
