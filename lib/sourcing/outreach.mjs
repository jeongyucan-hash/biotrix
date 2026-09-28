export const sender='andrew@biotrix.co.kr';
export const stages={draft:'문의 초안',sending:'발송 처리 중 · 재발송 금지',accepted:'발송 접수 · 회신 대기',failed:'발송 거절 · 설정 확인',unknown:'발송 결과 확인 필요 · 재발송 금지'};
export function mailReady(env=process.env){return env.HQ_MAIL_ENABLED==='true' && !!env.RESEND_API_KEY && env.HQ_MAIL_FROM===sender;}
export function email(value){const s=String(value||'').trim();return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(s)&&s.length<=254?s:null;}
export function draftFor(candidate){
 const recipient=(candidate.supplier_contact||'').match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0]||'';
 return {recipient,subject:'[BIOTRIX] 과일 위탁공급 조건 및 견적 문의',body:`안녕하세요. ${candidate.supplier_name||candidate.name} 담당자님.\n과일 온라인 판매를 준비하고 있는 BIOTRIX 정유찬입니다.\n\n쿠팡 판매용 사과 2~3kg 또는 샤인머스캣 2kg 공급을 검토하고 있습니다. 초기 판매량은 아직 미정이며, 조건 확인 후 소량 테스트부터 시작하려 합니다.\n\n현재 공급 가능한 상품에 대해 아래 사항을 안내 부탁드립니다.\n1. 고객 주문 1건 단위 직배송 및 BIOTRIX 명의 발송 가능 여부\n2. 옵션별 공급가, 포장·배송비, 추가배송비, 견적 유효기간\n3. 산지·품종·순중량·등급 기준과 실제 포장 사진\n4. 쿠팡 재판매 및 상품 이미지·상세설명 사용 허용 여부\n5. 발주 마감, 첫 출고 가능일, 송장 전달 방식\n6. 불량·파손 시 증빙기한과 환불·재배송 비용 부담\n7. 샘플 1박스 비용, 주문 방법, 결제 및 거래 증빙 조건\n\n가능한 상품의 단가표와 거래 안내를 부탁드립니다.\n감사합니다.\nBIOTRIX 정유찬\n${sender}`};
}
export function validateDraft(form){
 const recipient=email(form.get('recipient')),subject=String(form.get('subject')||'').trim(),body=String(form.get('body')||'').trim();
 if(!recipient||!subject||subject.length>160||/[\r\n]/.test(subject)||!body||body.length>10000)throw new Error('받는 이메일·제목·본문을 확인해 주세요.');
 return {recipient,subject,body};
}
export function validateQuote(form){
 const result={};
 for(const key of ['spec','evidence','terms','reply'])result[key]=String(form.get(key)||'').trim().slice(0,10000);
 if(!result.spec||!result.evidence||!result.reply)throw new Error('규격·회신 원문·확인 근거를 입력해 주세요.');
 for(const key of ['purchase','shipping']){const raw=String(form.get(key)??'').trim();result[key]=raw===''?null:Number(raw);if(result[key]!==null&&(!Number.isFinite(result[key])||result[key]<0||result[key]>1e9))throw new Error('금액은 0 이상 숫자, 미확인은 빈칸으로 입력해 주세요.');}
 result.valid_until=String(form.get('valid_until')||'');
 if(result.valid_until && (!/^\d{4}-\d{2}-\d{2}$/.test(result.valid_until)||new Date(result.valid_until).toISOString().slice(0,10)!==result.valid_until))throw new Error('견적 유효일을 확인해 주세요.');
 return result;
}
export async function dispatch(row,{env=process.env,fetcher=fetch}={}){
 if(!mailReady(env))return {status:'failed',error:'BIOTRIX 발신 연결이 완료되지 않았습니다.'};
 try{
  const res=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`hq-sourcing-${row.id}-v${row.version}`},body:JSON.stringify({from:`BIOTRIX 정유찬 <${sender}>`,to:[row.recipient],reply_to:sender,subject:row.subject,text:row.body}),signal:AbortSignal.timeout(20000)});
  if(!res.ok)return {status:res.status>=500||res.status===408||res.status===409?'unknown':'failed',error:`발송 서비스 응답 ${res.status}. 수신함 도착은 확인되지 않았습니다.`};
  const data=await res.json();if(!data.id)return {status:'unknown',error:'발송 접수번호를 확인하지 못했습니다.'};
  return {status:'accepted',provider_id:String(data.id)};
 }catch{return {status:'unknown',error:'연결이 끊겨 발송 여부를 확인하지 못했습니다. 중복 발송을 막기 위해 재시도하지 않습니다.'};}
}
