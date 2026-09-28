export const costs = [
 ['price','상품 판매가'],['customer_shipping','고객 부담 배송비'],['purchase','공급가'],['shipping','공급처 배송비'],['fee','플랫폼 비용 (수수료·관련 세금 포함)'],['discount','판매자 부담 할인'],['ad','주문당 광고비'],['claims','주문당 예상 클레임 비용']
];
export const checks = [
 ['channel','쿠팡 판매 허용'],['images','이미지·상세설명 사용 허용'],['spec','규격·원산지·표시사항 확인'],['stock','재고·출고 마감 확인'],['returns','불량·반품 비용과 주소 확인'],['listing','상품명·옵션·등록 자료 준비'],['order','발주·송장 처리 모의 점검']
];
export const prerequisites = [['permit','통신판매업 신고 상태'],['wing','쿠팡 판매자 승인 상태'],['supplier','공급처 계정·결제 준비']];
export function amount(value){
 if(value===null || value===undefined || String(value).trim()==='') return null;
 const n=Number(value);return Number.isFinite(n) && n>=0 && n<=1e9 ? n : null;
}
export function economics(data={}){
 const missing=costs.filter(([k])=>amount(data[k])===null).map(([,v])=>v);
 if(missing.length) return {missing,profit:null,margin:null,prepay:null};
 const v=Object.fromEntries(costs.map(([k])=>[k,amount(data[k])]));
 const revenue=v.price+v.customer_shipping-v.discount;
 const profit=revenue-v.purchase-v.shipping-v.fee-v.ad-v.claims;
 return {missing,profit,margin:revenue>0 ? profit/revenue*100:null,prepay:v.purchase+v.shipping};
}
export function readiness(data={},prereqs=[]){
 const e=economics(data);
 const blocked=checks.filter(([k])=>data.checks?.[k]!==true).map(([,label])=>label);
 for(const [key,label] of prerequisites) if(!prereqs.some(p=>p.key===key && p.status==='ready')) blocked.push(label);
 if(!data.source_url) blocked.push('상품 링크');
 if(!data.spec?.trim()) blocked.push('상품 규격');
 if(!data.evidence?.trim()) blocked.push('공급조건 확인 근거');
 if(e.missing.length) blocked.push('비용 입력 '+e.missing.join(', '));
 else if(e.profit<=0) blocked.push('주문당 공헌이익 0원 이하');
 return {ready:blocked.length===0,blocked,economics:e};
}
export function safeUrl(value){try{const u=new URL(String(value));return ['https:','http:'].includes(u.protocol) && !u.username && !u.password ? u.href : null;}catch{return null;}}
export function validatePlan(form){
 const data={};
 for(const key of ['name','spec','supplier','evidence','next_action']) data[key]=String(form.get(key)||'').trim().slice(0,2000);
 data.source_url=safeUrl(form.get('source_url'));
 if(!data.name || !data.source_url) throw new Error('상품명과 http(s) 상품 링크를 입력해 주세요.');
 for(const [key,label] of costs){const raw=form.get(key);data[key]=amount(raw);if(String(raw??'').trim() && data[key]===null)throw new Error(label+'는 0 이상 숫자로 입력해 주세요.');}
 data.checks=Object.fromEntries(checks.map(([k])=>[k,form.get(k)==='on']));
 if(Object.values(data.checks).some(Boolean) && !data.evidence)throw new Error('확인 완료 항목의 근거와 확인 날짜를 남겨 주세요.');
 data.decision=String(form.get('decision')||'review');
 if(!['review','test','hold','stop'].includes(data.decision))throw new Error('판단 상태가 올바르지 않습니다.');
 return data;
}
