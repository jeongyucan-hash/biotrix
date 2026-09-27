import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createGrowthExperiment, updateGrowthExperiment } from "./actions";

export const metadata={title:"Growth · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  if(value===null || value===undefined) return "—";
  return new Intl.NumberFormat("ko-KR").format(Number(value))+"원";
}

export default async function Growth(){
  const supabase=await createClient();

  const [experimentsResult,oppsResult,productsResult]=await Promise.all([
    supabase.from("growth_experiments").select("*").order("updated_at",{ascending:false}),
    supabase.from("opportunities").select("id,title,status").order("updated_at",{ascending:false}).limit(50),
    supabase.from("products").select("id,name,status").order("updated_at",{ascending:false}).limit(50),
  ]);

  const experiments=experimentsResult.data || [];
  const opportunities=oppsResult.data || [];
  const products=productsResult.data || [];

  const running=experiments.filter((x)=>x.status==="running").length;
  const wonCount=experiments.filter((x)=>x.status==="won").length;
  const spent=experiments.reduce((sum,x)=>sum+Number(x.spend||0),0);

  return (
    <HQShell active="Growth" title="Growth Lab">
      <section className="hqMetrics">
        <article><span>Total experiments</span><strong>{experiments.length}</strong></article>
        <article><span>Running</span><strong>{running}</strong></article>
        <article><span>Won</span><strong>{wonCount}</strong></article>
        <article><span>Recorded spend</span><strong>{won(spent)}</strong></article>
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>New Experiment</h2>
            <span>가설 → 지표 → 판정</span>
          </div>

          <form action={createGrowthExperiment} className="stackForm">
            <input name="title" placeholder="실험명" required />
            <input name="channel" placeholder="채널: 쿠팡 / 네이버 / 인스타 / B2B..." required />
            <textarea name="hypothesis" rows="4" placeholder="예: 썸네일에 산지/당도를 전면 노출하면 CTR이 상승한다." required />
            <input name="metric" placeholder="핵심 지표: CTR, CVR, CAC, ROAS, 문의율..." required />
            <div className="threeCols">
              <input name="target_value" type="number" step="0.01" placeholder="목표값" />
              <input name="budget" type="number" min="0" step="1" placeholder="예산" />
              <input name="start_date" type="date" />
            </div>
            <input name="end_date" type="date" />
            <select name="opportunity_id" defaultValue="">
              <option value="">Opportunity 연결 없음</option>
              {opportunities.map((o)=><option key={o.id} value={o.id}>{o.title} · {o.status}</option>)}
            </select>
            <select name="product_id" defaultValue="">
              <option value="">Product 연결 없음</option>
              {products.map((p)=><option key={p.id} value={p.id}>{p.name} · {p.status}</option>)}
            </select>
            <textarea name="notes" rows="3" placeholder="실행 조건 / 크리에이티브 / 비교군 메모" />
            <button className="hqButton" type="submit">Experiment 생성</button>
          </form>
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>Operating Rule</h2>
            <span>Growth discipline</span>
          </div>
          <div className="workflowSteps">
            <div><b>1</b><span>한 실험에 하나의 핵심 가설만 둔다.</span></div>
            <div><b>2</b><span>실행 전에 성공 기준과 예산을 먼저 고정한다.</span></div>
            <div><b>3</b><span>성과가 애매하면 Inconclusive로 남긴다.</span></div>
            <div><b>4</b><span>Won/Lost를 다음 제품·마케팅 의사결정의 근거로 재사용한다.</span></div>
          </div>
        </article>
      </section>

      <section className="hqPanel">
        <div className="panelHead">
          <h2>Experiment Board</h2>
          <span>{experiments.length} experiment(s)</span>
        </div>

        {experiments.length ? (
          <div className="growthGrid">
            {experiments.map((exp)=>{
              const progress=(exp.target_value!==null && exp.actual_value!==null && Number(exp.target_value)!==0)
                ? (Number(exp.actual_value)/Number(exp.target_value))*100
                : null;

              return (
                <article className="growthCard" key={exp.id}>
                  <div className="approvalMeta">
                    <span>{exp.channel}</span>
                    <span>{exp.status}</span>
                  </div>
                  <h3>{exp.title}</h3>
                  <p>{exp.hypothesis}</p>

                  <div className="growthMetrics">
                    <div><span>Metric</span><b>{exp.metric}</b></div>
                    <div><span>Target</span><b>{exp.target_value ?? "—"}</b></div>
                    <div><span>Actual</span><b>{exp.actual_value ?? "—"}</b></div>
                    <div><span>Progress</span><b>{progress===null ? "—" : progress.toFixed(1)+"%"}</b></div>
                    <div><span>Budget</span><b>{won(exp.budget)}</b></div>
                    <div><span>Spend</span><b>{won(exp.spend)}</b></div>
                  </div>

                  <form action={updateGrowthExperiment} className="growthUpdateForm">
                    <input type="hidden" name="id" value={exp.id} />
                    <select name="status" defaultValue={exp.status}>
                      <option value="planned">Planned</option>
                      <option value="running">Running</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                      <option value="inconclusive">Inconclusive</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <input name="actual_value" type="number" step="0.01" defaultValue={exp.actual_value ?? ""} placeholder="실제값" />
                    <input name="spend" type="number" min="0" step="1" defaultValue={exp.spend ?? ""} placeholder="실지출" />
                    <textarea name="notes" rows="3" defaultValue={exp.notes || ""} placeholder="결과/학습" />
                    <button type="submit">결과 저장</button>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="hqEmpty">
            <strong>아직 Growth Experiment가 없습니다.</strong>
            <p>첫 판매·콘텐츠·광고 실험을 등록하고 가설과 결과를 분리해 기록하세요.</p>
          </div>
        )}
      </section>
    </HQShell>
  );
}
