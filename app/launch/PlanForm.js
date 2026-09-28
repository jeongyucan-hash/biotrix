'use client';
import {useState} from 'react';
import ActionForm from '../components/ActionForm';
import {savePlan} from './actions';
import {costs,checks,economics} from '../../lib/launch/model.mjs';
const won=n=>n===null?'미입력':Math.round(n).toLocaleString('ko-KR')+'원';
export default function PlanForm({plan}){
 const d=plan.data||{};const [values,setValues]=useState(d);const e=economics(values);
 return <ActionForm action={savePlan} className="launchForm">
 <input type="hidden" name="id" value={plan.id}/><input type="hidden" name="version" value={plan.version||0}/>
 <div className="launchFields">
 <label>상품명<input name="name" defaultValue={d.name} maxLength="2000" required/></label>
 <label>공급처 상품 링크<input name="source_url" type="url" defaultValue={d.source_url} required placeholder="https://…"/></label>
 <label>규격·옵션<input name="spec" defaultValue={d.spec} placeholder="품종·중량·등급·포장 단위"/></label>
 <label>공급처<input name="supplier" defaultValue={d.supplier}/></label>
 </div>
 <h3>주문 1건의 예상 손익</h3><p>모든 비용은 원 단위로 입력하세요. 비용이 없으면 0, 미확인이면 비워 두세요. 공급가에 배송비가 포함됐다면 배송비는 0으로 입력합니다.</p>
 <div className="launchFields">{costs.map(([key,label])=><label key={key}>{label}<input name={key} type="number" min="0" max="1000000000" step="0.01" value={values[key]??''} onChange={ev=>setValues({...values,[key]:ev.target.value})}/></label>)}</div>
 <div className="launchEstimate" aria-live="polite"><b>예상 공헌이익 {won(e.profit)}</b><span>{e.margin===null?'비용을 모두 입력하면 계산합니다.':`공헌이익률 ${e.margin.toFixed(1)}% · 공급처 선결제 ${won(e.prepay)}`}</span></div>
 <p>세금·고정비 차감 전 추정치입니다. 플랫폼 비용은 실제 카테고리와 배송비 부과 조건을 확인한 금액을 입력하세요. 클레임 비용은 예상치이며 매출·순이익 실적이 아닙니다.</p>
 <h3>상품 등록 전 확인</h3><div className="launchChecks">{checks.map(([key,label])=><label key={key}><input name={key} type="checkbox" defaultChecked={d.checks?.[key]===true}/>{label}</label>)}</div>
 <label>확인 근거·날짜<textarea name="evidence" defaultValue={d.evidence} rows="3" placeholder="공급처 안내 링크, 확인 날짜, 출고·보상 조건. 비밀번호나 API 키는 적지 마세요."/></label>
 <label>현재 판단<select name="decision" defaultValue={d.decision||'review'}><option value="review">검토 중</option><option value="test">판매 실험 후보</option><option value="hold">보류</option><option value="stop">중단</option></select></label>
 <label>다음 행동<input name="next_action" defaultValue={d.next_action} placeholder="예: 공급처의 불량 재배송 부담 확인"/></label>
 <button className="hqButton">준비 내용 저장</button></ActionForm>;
}
