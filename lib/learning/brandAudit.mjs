import {createHash} from 'node:crypto';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const issue = (code, severity, detail) => ({code, severity, detail});

// Shared pure evaluator: the server action supplies bytes; CI supplies local files.
export function auditBrand({manifest, assets, site}) {
 const issues=[];
 if (!/^\d+\.\d+$/.test(manifest?.version||'')) issues.push(issue('MASTER_VERSION','error','디자인 마스터 버전이 없습니다.'));
 const files=manifest?.files||[];
 const names=new Set();
 for(const f of files){
  if(names.has(f.name))issues.push(issue('DUPLICATE_ASSET','error',f.name));
  names.add(f.name);
  const bytes=assets[f.name];
  if(!bytes){issues.push(issue('MISSING_ASSET','error',f.name));continue;}
  if(bytes.length!==f.bytes||hash(bytes)!==f.sha256)issues.push(issue('ASSET_INTEGRITY','error',f.name));
 }
 if(!names.has('BIOTRIX_Logo_Negative_B.svg'))issues.push(issue('MISSING_LOGO','error','로고 벡터 원본이 없습니다.'));
 const logo=assets['BIOTRIX_Logo_Negative_B.svg']?.toString('utf8')||'';
 if(logo&&!logo.includes('viewBox="0 0 90 100"'))issues.push(issue('LOGO_GEOMETRY','error','A안 심볼 viewBox가 달라졌습니다.'));
 if(site){
  if(site.logo&&logo&&site.logo!==logo)issues.push(issue('PUBLIC_LOGO_MISMATCH','error','공개 사이트와 HQ 로고가 다릅니다.'));
  if(site.favicon&&site.logo&&site.favicon!==site.logo)issues.push(issue('FAVICON_MISMATCH','error','파비콘과 헤더 심볼이 다릅니다.'));
  if(site.css&&!/--ivory:\s*#(?:fff|ffffff)(?:[;}])/i.test(site.css))issues.push(issue('CANVAS_NOT_WHITE','error','공개 사이트 기본 배경이 흰색이 아닙니다.'));
  const imageRefs=[...(site.home||'').matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.includes('symbol'));
  if(new Set(imageRefs).size<imageRefs.length)issues.push(issue('REPEATED_HOME_IMAGE','warning','메인 화면에서 같은 이미지 URL이 다시 사용됩니다.'));
  const pictures=(site.photos||[]).filter(Boolean);
  if(new Set(pictures.map(hash)).size<pictures.length)issues.push(issue('DUPLICATE_PHOTO_BYTES','warning','서로 다른 사진 파일에 동일한 바이트가 있습니다.'));
 }
 return {schema:'brand_audit_v1',masterVersion:manifest?.version||null,assetsChecked:files.length,issues,status:issues.some(x=>x.severity==='error')?'fail':issues.length?'review':'pass',generatedAt:new Date().toISOString()};
}
