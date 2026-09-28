export function costLabel(job) {
  if (job.estimated_cost_usd != null) return `약 $${Number(job.estimated_cost_usd).toFixed(4)}`;
  if (!job.calls_used && !job.completed_at) return '호출 전';
  const reasons={model_pricing_unavailable:'모델 가격 없음',model_pricing_incomplete:'가격 항목 불완전',
    model_catalog_unavailable:'가격 목록 조회 실패',token_usage_unavailable:'토큰 사용량 없음',
    model_unavailable:'응답 모델 없음',response_unavailable:'AI 응답 없음',
    historical_pricing_not_recorded:'기존 실행 가격 미기록'};
  return `추정 불가 · ${reasons[job.cost_reason] || '가격 정보 없음'}`;
}

export function recentCost(jobs, now=Date.now()) {
  const recent=jobs.filter(j=>j.started_at && new Date(j.started_at).getTime()>now-86400000 &&
    new Date(j.started_at).getTime()<=now && j.calls_used>0);
  return {known:recent.reduce((sum,j)=>sum+(j.estimated_cost_usd == null ? 0 : Number(j.estimated_cost_usd)),0),
    unknown:recent.filter(j=>j.estimated_cost_usd == null).length, count:recent.length};
}
