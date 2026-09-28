export const DESIGN_PREFIX = '[디자인실]';
export function validateDecision(form) {
  const fields = Object.fromEntries(['title','context','decision','rationale'].map(key => [key,String(form.get(key)||'').trim()]));
  if (!fields.title || fields.title.length>140 || !fields.decision || fields.decision.length>5000 || !fields.rationale || fields.rationale.length>3000 || fields.context.length>3000) return null;
  return fields;
}
export function validateRequest(form) {
  const title=String(form.get('title')||'').trim();
  const objective=String(form.get('objective')||'').trim();
  const criteria=String(form.get('criteria')||'').trim();
  const priority=String(form.get('priority')||'medium');
  if(!title || title.length>140 || !objective || objective.length>6000 || !criteria || criteria.length>3000 || !['low','medium','high','urgent'].includes(priority)) return null;
  return {title,objective,criteria,priority};
}
export function resolveAsset(manifest,name) {
  if(typeof name!=='string' || !/^[A-Za-z0-9_.-]+$/.test(name)) return null;
  return manifest.files.find(file=>file.name===name) || null;
}
