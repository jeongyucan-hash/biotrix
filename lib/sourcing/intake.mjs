export function quickMission(text) {
  const brief=String(text || '').trim();
  if(brief.length<5 || brief.length>3000) throw new Error('요청은 5~3,000자로 입력해 주세요.');
  return {title:brief.replace(/\s+/g,' ').slice(0,80),brief,target_channels:['쿠팡'],max_initial_cash:1000000};
}
