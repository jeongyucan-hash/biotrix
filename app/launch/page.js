import {randomUUID} from 'node:crypto';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import HQShell from '../components/HQShell';
import ActionForm from '../components/ActionForm';
import {createClient} from '../../lib/supabase/server';
import {prerequisites,readiness,safeUrl} from '../../lib/launch/model.mjs';
import {savePrerequisite,saveReview} from './actions';
import PlanForm from './PlanForm';
import './launch.css';
export const metadata={title:'첫 판매 준비 · BIOTRIX HQ',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
const won=n=>n===null?'미확인':Math.round(n).toLocaleString('ko-KR')+'원';
export default async function Launch(){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login?next=/launch');
 const {data:admin}=await db.from('admin_users').select('active').eq('auth_user_id',user.id).maybeSingle();if(!admin?.active)redirect('/setup');
 const results=await Promise.all([
 db.from('launch_plans').select('*').order('updated_at',{ascending:false}),
 db.from('launch_prerequisites').select('*'),
 db.from('launch_reviews').select('*').order('created_at',{ascending:false}).limit(100),
 db.from('sourcing_candidates').select('id,name,source_url,purchase_price,target_retail_price,supplier_name').neq('status','rejected').order('updated_at',{ascending:false}).limit(30)
 ]);
 const [plans,pre,reviews,candidates]=results.map(r=>r.data||[]);const failed=results.some(r=>r.error);
 const ready=plans.filter(p=>readiness(p.data,pre).ready&&p.data.decision!=='stop'&&p.data.decision!=='hold');
 return <HQShell active="첫 판매 준비" title="쿠팡 첫 판매 준비">
 <section className="hqPanel launchIntro"><div><span className="eyebrow">10월 1일 판매 개시 목표</span><h2>상품 1~3개로 첫 주문까지</h2><p>승인·공급조건·비용을 확인하고, 주문 처리 결과를 다음 판단에 반영합니다.</p></div><div className="launchCount"><b>{ready.length}</b><span>내부 점검 충족 / 후보 {plans.length}개</span></div></section>
 <div className="launchNotice">쿠팡·도매매 계정은 아직 연동되지 않았습니다. 링크와 상태는 직접 입력한 기록이며, 저장 버튼은 상품을 자동 수집하거나 쿠팡에 등록하지 않습니다.</div>
 {failed ? <section className="hqPanel" role="alert">준비 자료를 불러오지 못했습니다. 빈 자료로 판단하지 마세요. 잠시 후 새로고침해 주세요.</section> : <>
 <section className="hqPanel"><div className="panelHead"><h2>먼저 확인할 3가지</h2><span>완료 근거를 남겨 주세요</span></div><div className="launchPrereqs">{prerequisites.map(([key,label])=>{const row=pre.find(p=>p.key===key);return <ActionForm key={key} action={savePrerequisite} className="launchForm"><input type="hidden" name="key" value={key}/><h3>{label}</h3><label>상태<select name="status" defaultValue={row?.status||'unknown'}><option value="unknown">미확인</option><option value="pending">진행·승인 대기</option><option value="ready">완료 확인</option></select></label><label>근거·확인 날짜<input name="evidence" defaultValue={row?.evidence} placeholder="예: WING 승인 화면 확인, 9/30"/></label><button className="hqButton">상태 저장</button></ActionForm>})}</div><p><a href="https://wing.coupang.com/" target="_blank" rel="noreferrer">쿠팡 WING 열기</a> · <a href="https://domeme.domeggook.com/" target="_blank" rel="noreferrer">도매매 열기</a></p></section>
 <section className="hqPanel"><div className="panelHead"><h2>상품 후보 비교</h2><Link href="/sourcing">공급처 조사 보기</Link></div>{plans.length ? <div className="launchTable"><table><thead><tr><th>상품</th><th>예상 공헌이익</th><th>준비 상태</th><th>다음 행동</th></tr></thead><tbody>{plans.map(p=>{const r=readiness(p.data,pre);return <tr key={p.id}><td><a href={'#plan-'+p.id}>{p.data.name}</a><small>{p.data.spec||'규격 미확인'}</small></td><td>{won(r.economics.profit)}</td><td>{['hold','stop'].includes(p.data.decision)?(p.data.decision==='hold'?'보류':'중단'):r.ready?'내부 점검 충족':`${r.blocked.length}개 확인 필요`}</td><td>{p.data.next_action||r.blocked[0]||'WING에서 최종 등록 확인'}</td></tr>})}</tbody></table></div>:<div className="hqEmpty"><strong>등록 준비 상품이 없습니다.</strong><p>아래에 판매 가능한 상품 링크와 공급조건을 넣어 첫 후보를 만드세요. 기존 공급업체 조사 기록은 판매 상품으로 간주하지 않습니다.</p></div>}
 <details className="launchDetails"><summary>+ 상품 링크로 후보 추가</summary><PlanForm plan={{id:randomUUID(),data:{}}}/></details>
 {candidates.length>0&&<details className="launchDetails"><summary>기존 조사 후보 참고 ({candidates.length}건)</summary>{candidates.map(c=><p key={c.id}>{safeUrl(c.source_url)?<a href={safeUrl(c.source_url)} target="_blank" rel="noreferrer">{c.name}</a>:c.name} · 공급가 {won(c.purchase_price)} · 판매가 {won(c.target_retail_price)}</p>)}</details>}</section>
 {plans.map(p=>{const r=readiness(p.data,pre);return <section className="hqPanel" id={'plan-'+p.id} key={p.id}><div className="panelHead"><h2>{p.data.name}</h2><span>{r.ready?'내부 점검 충족':'확인 필요'}</span></div>{r.blocked.length>0&&<p className="launchNotice">남은 확인: {r.blocked.join(' · ')}</p>}<details className="launchDetails"><summary>공급조건·손익·준비 상태 수정</summary><PlanForm key={p.version} plan={p}/></details><details className="launchDetails"><summary>판매 실험 피드백 기록</summary><ActionForm action={saveReview} className="launchForm"><input type="hidden" name="id" value={randomUUID()}/><input type="hidden" name="plan_id" value={p.id}/><div className="launchFields"><label>관측 기간<input name="period" required placeholder="예: 10/1~10/7"/></label><label>실제 주문수<input name="orders" type="number" min="0" step="1" required/></label></div><label>관측 사실·출처<textarea name="facts" required placeholder="노출·클릭·주문·문의·출고 지연 등, 확인한 자료"/></label><label>원인 가설<textarea name="hypothesis" placeholder="사실과 구분해서 작성"/></label><label>다음 행동·확인할 결과<textarea name="action" required placeholder="유지·수정·중단 사유와 다음 검토 조건"/></label><button className="hqButton">피드백 기록</button></ActionForm></details>{reviews.filter(v=>v.plan_id===p.id).map(v=><article className="launchReview" key={v.id}><b>{v.period} · 주문 {v.orders}건</b><p>관측: {v.facts}</p><p>가설: {v.hypothesis||'미작성'}</p><p>다음 행동: {v.action}</p></article>)}</section>})}
 <section className="hqPanel"><h2>이번 개발의 완료 기준</h2><ol><li>후보 10개 검토 → 상품 1~3개 선정</li><li>실제 공급조건과 비용 입력 → 공헌이익 확인</li><li>승인과 등록 자료 확인 → WING에서 판매 요청</li><li>첫 주문 발주·송장·배송 확인 → 7일·14일 피드백 기록</li></ol><p>승인과 상품 준비가 완료되면 판매를 시작합니다. 날짜만으로 준비 완료를 판정하지 않습니다.</p></section>
 </>}
 </HQShell>;
}
