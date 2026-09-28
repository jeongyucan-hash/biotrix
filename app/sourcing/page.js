import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { addCandidate, createMission, promoteCandidate, updateCandidateStatus } from "./actions";
import ResearchControl from './ResearchControl';
import {researchConfiguration} from '../../lib/sourcing/research.mjs';
import {safeUrl} from '../../lib/ai/responses.mjs';

export const maxDuration=180;

export const metadata={title:"Sourcing · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  if(value===null || value===undefined) return "—";
  return new Intl.NumberFormat("ko-KR").format(Number(value))+"원";
}

export default async function Sourcing(){
  const supabase=await createClient();

  const [missionsResult,candidatesResult,jobsResult,settingsResult]=await Promise.all([
    supabase
      .from("sourcing_missions")
      .select("*")
      .order("updated_at",{ascending:false}),
    supabase
      .from("sourcing_candidates")
      .select("*")
      .order("updated_at",{ascending:false}),
    supabase
      .from("sourcing_research_jobs")
      .select("id,mission_id,status,objective,search_queries,candidate_target,candidates_created,sources_found,model_name,calls_used,estimated_cost_usd,error_message,created_at,started_at,completed_at,result_json,input_tokens,output_tokens")
      .order("created_at",{ascending:false}),
    supabase
      .from("company_settings")
      .select("key,value")
      .in("key",["ai.enabled","sourcing.research.enabled","sourcing.research.max_estimated_cost_usd"]),
  ]);

  const missions=missionsResult.data || [];
  const candidates=candidatesResult.data || [];
  const jobs=jobsResult.data || [];
  const settings=Object.fromEntries((settingsResult.data || []).map((row)=>[row.key,row.value]));
  const automatedResearchEnabled=settings["ai.enabled"]===true && settings["sourcing.research.enabled"]===true;
  const configured=researchConfiguration().configured;

  return (
    <HQShell active="Sourcing" title="Sourcing">
      {[missionsResult,candidatesResult,jobsResult,settingsResult].some(r=>r.error) && <p role="alert">일부 데이터를 불러오지 못했습니다. 결과가 없는 것으로 판단하지 말고 새로고침해 주세요.</p>}
      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>New Sourcing Mission</h2>
            <span>무엇을 찾을지 먼저 정의</span>
          </div>

          <form action={createMission} className="stackForm">
            <input name="title" placeholder="미션명" required />
            <input name="category" placeholder="카테고리" />
            <input name="target_customer" placeholder="타깃 고객" />
            <input name="target_channels" placeholder="채널: 쿠팡, 네이버, B2B" />
            <textarea name="brief" rows="5" placeholder="찾아야 하는 상품/공급처 조건, 제외조건, 핵심 가설" required />
            <div className="threeCols">
              <input name="target_retail_price" type="number" min="0" step="1" placeholder="목표 판매가" />
              <input name="target_gross_margin_pct" type="number" step="0.1" placeholder="목표 매출총이익률 %" />
              <input name="max_initial_cash" type="number" min="0" step="1" placeholder="초기 투입 상한" />
            </div>
            <button className="hqButton" type="submit">+ Sourcing Mission</button>
          </form>
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>Pipeline</h2>
            <span>{missions.length} mission(s)</span>
          </div>

          <div className="hqList">
            {missions.length ? missions.map((mission)=>{
              const count=candidates.filter((c)=>c.mission_id===mission.id).length;
              const shortlist=candidates.filter((c)=>c.mission_id===mission.id && c.status==="shortlisted").length;
              return (
                <div key={mission.id}>
                  <b>{mission.title}</b>
                  <span>{mission.status} · {count} candidates · {shortlist} shortlist</span>
                </div>
              );
            }) : (
              <div className="hqEmpty">
                <strong>아직 Sourcing Mission이 없습니다.</strong>
                <p>첫 상품 탐색 조건을 정의하면 후보를 한 파이프라인에서 관리합니다.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {missions.map((mission)=>{
        const rows=candidates.filter((c)=>c.mission_id===mission.id);
        const missionJobs=jobs.filter((j)=>j.mission_id===mission.id);
        const latestJob=missionJobs[0];

        return (
          <section className="hqPanel" key={mission.id}>
            <div className="panelHead">
              <div>
                <h2>{mission.title}</h2>
                <span>{mission.category || "General"} · {mission.status}</span>
              </div>
              <span>{rows.length} candidate(s)</span>
            </div>

            <div className="missionBrief">
              <p>{mission.brief}</p>
              <div className="missionTargets">
                <span>판매가 <b>{won(mission.target_retail_price)}</b></span>
                <span>목표 마진 <b>{mission.target_gross_margin_pct ?? "—"}%</b></span>
                <span>초기자금 <b>{won(mission.max_initial_cash)}</b></span>
              </div>
            </div>
            <div className="researchPrep">
              <div>
                <strong>Sourcing Research</strong>
                <p>공개 공급처 조사 → 출처 확인 → 후보·지식 저장. 로그인 뒤 상품목록이나 공급처 답변은 별도로 확보해야 합니다.</p>
              </div>

              {latestJob ? (
                <div className="researchJobSummary">
                  <div><span>상태</span><b>{{queued:'준비됨 · 실행 전',running:'실행 중',completed:'조사 완료 · 조건 검토 필요',failed:'실패',cancelled:'취소'}[latestJob.status]}</b></div>
                  <div><span>Target</span><b>{latestJob.candidate_target} candidates</b></div>
                  <div><span>Sources</span><b>{latestJob.sources_found}</b></div>
                  <div><span>비용</span><b>{latestJob.calls_used ? '사용량 기록 · 청구액 미확인' : '호출 전'}</b></div>
                  <div><span>실행 시각</span><b>{new Date(latestJob.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',hour12:false})} KST</b></div>
                  {latestJob.error_message && <p role="alert">{latestJob.error_message}</p>}
                  {latestJob.result_json && <details open>
                    <summary>조사 결과 · 출처 {latestJob.sources_found}개 · 신규 후보 {latestJob.candidates_created}개</summary>
                    <p style={{whiteSpace:'pre-wrap'}}>{latestJob.result_json.summary}</p>
                    <p style={{whiteSpace:'pre-wrap'}}>{latestJob.result_json.limitations}</p>
                    <ul>{(latestJob.result_json.sources || []).filter(s=>safeUrl(s.url)).map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title || s.url}</a></li>)}</ul>
                    <small>입력 {latestJob.input_tokens} / 출력 {latestJob.output_tokens} 토큰 · {latestJob.model_name}</small>
                  </details>}
                  <details>
                    <summary>Prepared search queries</summary>
                    <div className="queryList">
                      {(latestJob.search_queries || []).map((query,index)=><span key={index}>{query}</span>)}
                    </div>
                  </details>
                </div>
              ) : (
                <p>실행 기록 없음</p>
              )}
              <ResearchControl missionId={mission.id} enabled={automatedResearchEnabled} configured={configured}
                closed={['completed','cancelled'].includes(mission.status)} job={latestJob || null}/>
              {missionJobs.length>1 && <details>
                <summary>이전 조사 기록 {missionJobs.length-1}건</summary>
                <ul>{missionJobs.slice(1).map(j=><li key={j.id}>
                  {new Date(j.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',hour12:false})} KST · {j.status} · 출처 {j.sources_found}개
                  {j.error_message && <p>{j.error_message}</p>}
                  {j.result_json && <p>{j.result_json.summary}</p>}
                </li>)}</ul>
              </details>}
            </div>

            <details className="newOpportunity">
              <summary>+ 후보 직접 추가</summary>
              <form action={addCandidate} className="candidateForm">
                <input type="hidden" name="mission_id" value={mission.id} />
                <input name="name" placeholder="상품/업체명" required />
                <select name="candidate_type" defaultValue="product">
                  <option value="product">Product</option>
                  <option value="supplier">Supplier</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="odm_oem">ODM/OEM</option>
                  <option value="wholesaler">Wholesaler</option>
                </select>
                <input name="category" placeholder="카테고리" />
                <input name="source_name" placeholder="출처/플랫폼" />
                <input name="source_url" type="url" placeholder="Source URL" />
                <input name="supplier_name" placeholder="공급처명" />
                <input name="supplier_contact" placeholder="공급처 연락처" />
                <input name="purchase_price" type="number" min="0" step="1" placeholder="매입가" />
                <input name="target_retail_price" type="number" min="0" step="1" placeholder="예상 판매가" />
                <input name="moq" type="number" min="0" step="1" placeholder="MOQ" />
                <input name="lead_time_days" type="number" min="0" step="1" placeholder="리드타임(일)" />
                <input name="settlement_terms" placeholder="정산조건" />
                <select name="supply_risk" defaultValue="unknown">
                  <option value="unknown">Supply risk unknown</option>
                  <option value="low">Low risk</option>
                  <option value="medium">Medium risk</option>
                  <option value="high">High risk</option>
                </select>
                <select name="evidence_status" defaultValue="unverified">
                  <option value="unverified">Unverified</option>
                  <option value="source_claim">Source claim</option>
                  <option value="verified">Verified</option>
                  <option value="inference">Inference</option>
                </select>
                <textarea name="product_summary" rows="3" placeholder="상품/업체 요약" />
                <textarea name="notes" rows="3" placeholder="추가 메모" />
                <button className="hqButton" type="submit">후보 저장</button>
              </form>
            </details>

            {rows.length ? (
              <div className="sourcingGrid">
                {rows.map((candidate)=>(
                  <article className="sourcingCard" key={candidate.id}>
                    <div className="approvalMeta">
                      <span>{candidate.candidate_type}</span>
                      <span>{candidate.status}</span>
                    </div>
                    <h3>{candidate.name}</h3>
                    <p>{candidate.product_summary || candidate.notes || "설명 없음"}</p>

                    <div className="candidateMetrics">
                      <span>매입 <b>{won(candidate.purchase_price)}</b></span>
                      <span>예상판매 <b>{won(candidate.target_retail_price)}</b></span>
                      <span>예상마진 <b>{candidate.estimated_gross_margin_pct===null ? "—" : Number(candidate.estimated_gross_margin_pct).toFixed(1)+"%"}</b></span>
                      <span>MOQ <b>{candidate.moq ?? "—"}</b></span>
                    </div>

                    <div className="candidateEvidence">
                      <span>{candidate.evidence_status}</span>
                      <span>Supply {candidate.supply_risk || "unknown"}</span>
                    </div>

                    {candidate.source_url && (
                      <a className="sourceLink" href={candidate.source_url} target="_blank" rel="noreferrer">
                        Source 열기
                      </a>
                    )}

                    <div className="candidateActions">
                      <form action={updateCandidateStatus}>
                        <input type="hidden" name="id" value={candidate.id} />
                        <select name="status" defaultValue={candidate.status}>
                          <option value="discovered">Discovered</option>
                          <option value="researching">Researching</option>
                          <option value="screening">Screening</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="promoted">Promoted</option>
                        </select>
                        <button type="submit">Update</button>
                      </form>

                      {!candidate.opportunity_id && candidate.status!=="rejected" && (
                        <form action={promoteCandidate}>
                          <input type="hidden" name="candidate_id" value={candidate.id} />
                          <button className="promoteButton" type="submit">Founder Room 승격</button>
                        </form>
                      )}

                      {candidate.opportunity_id && <div className="promotedLabel">Founder Room 연결됨</div>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="hqEmpty">
                <strong>아직 후보가 없습니다.</strong>
                <p>지금은 직접 후보를 넣을 수 있고, 다음 단계에서 Sourcing Agent가 웹 검색으로 자동 채우게 됩니다.</p>
              </div>
            )}
          </section>
        );
      })}
    </HQShell>
  );
}
