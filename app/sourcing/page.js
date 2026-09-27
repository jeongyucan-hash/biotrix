import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { addCandidate, createMission, promoteCandidate, updateCandidateStatus } from "./actions";

export const metadata={title:"Sourcing · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  if(value===null || value===undefined) return "—";
  return new Intl.NumberFormat("ko-KR").format(Number(value))+"원";
}

export default async function Sourcing(){
  const supabase=await createClient();

  const [missionsResult,candidatesResult]=await Promise.all([
    supabase
      .from("sourcing_missions")
      .select("*")
      .order("updated_at",{ascending:false}),
    supabase
      .from("sourcing_candidates")
      .select("*")
      .order("updated_at",{ascending:false}),
  ]);

  const missions=missionsResult.data || [];
  const candidates=candidatesResult.data || [];

  return (
    <HQShell active="Sourcing" title="Sourcing">
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
