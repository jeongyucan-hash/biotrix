// Beta-binomial update for aggregate conversion counts. No visitor-level data.
export function evaluateVariants(observations, {minimumImpressions=100}={}) {
 const groups=new Map();
 for(const row of observations){
  const {page,variant,impressions,actions}=row;
  if(!/^\/[a-z0-9/-]{0,100}$/.test(page||'')||!(/^[a-z0-9_-]{1,50}$/.test(variant||''))||!Number.isSafeInteger(impressions)||impressions<1||!Number.isSafeInteger(actions)||actions<0||actions>impressions)throw new Error('Invalid observation');
  const key=page+'|'+variant, old=groups.get(key)||{page,variant,impressions:0,actions:0,observations:0};
  old.impressions+=impressions;old.actions+=actions;old.observations++;groups.set(key,old);
 }
 const results=[...groups.values()].map(g=>{
  const alpha=g.actions+1,beta=g.impressions-g.actions+1,mean=alpha/(alpha+beta);
  const variance=alpha*beta/((alpha+beta)**2*(alpha+beta+1));
  return {...g,posteriorMean:mean,conservativeScore:Math.max(0,mean-1.96*Math.sqrt(variance)),eligible:g.impressions>=minimumImpressions};
 }).sort((a,b)=>b.conservativeScore-a.conservativeScore);
 return {algorithm:'beta_binomial_v1',minimumImpressions,observationsCount:observations.length,totalImpressions:observations.reduce((n,r)=>n+r.impressions,0),variants:results,recommendation:results.filter(r=>r.eligible).length>=2?results.find(r=>r.eligible)?.variant:null};
}
