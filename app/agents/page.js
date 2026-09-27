import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { runInventoryAgent } from "./actions";

export const metadata={title:"AI Agents · BIOTRIX HQ",robots:{index:false,follow:false}};

const agents=[
  ["CEO Agent","전사 KPI·리스크·우선순위 요약","PLANNED"],
  ["Commerce Agent","상품·매출·전환·고객 행동 분석","PLANNED"],
  ["Sourcing Agent","신규 상품·공급처 후보 탐색 및 검토","PLANNED"],
  ["Inventory Agent","재고 소진·안전재고·발주 제안","ACTIVE"],
  ["CS Agent","문의 분류·답변 초안·반복 이슈 탐지","PLANNED"],
  ["Marketing Agent","콘텐츠·캠페인·광고 성과 분석","PLANNED"],
  ["Finance Agent","매출·원가·마진·현금흐름 분석","PLANNED"],
  ["Knowledge Agent","문서·결정·SOP 연결","PLANNED"],
];

export default async function Agents(){
  const supabase = await createClient();

  const [{ data: approvals }, { data: runs }] = await Promise.all([
    supabase
      .from("approvals")
      .select("id,title,description,requested_by,status,created_at")
      .eq("status","pending")
      .order("created_at",{ascending:false})
      .limit(8),
    supabase
      .from("agent_runs")
      .select("id,agent_name,status,summary,created_at,completed_at")
      .order("created_at",{ascending:false})
      .limit(8),
  ]);

  return (
    <HQShell active="AI Agents" title="AI Agents">
      <section className="agentGrid">
        {agents.map(([name,desc,status])=>(
          <article className="agentCard" key={name}>
            <div className="agentStatus">{status}</div>
            <h2>{name}</h2>
            <p>{desc}</p>
            {name === "Inventory Agent" ? (
              <form action={runInventoryAgent}>
                <button type="submit">Run Inventory Agent</button>
              </form>
            ) : (
              <button disabled>Configure</button>
            )}
          </article>
        ))}
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>Human Approval Queue</h2>
            <span>{approvals?.length || 0} pending</span>
          </div>
          {approvals?.length ? (
            <div className="hqList">
              {approvals.map((item)=>(
                <div key={item.id}>
                  <b>{item.title}</b>
                  <span>{item.requested_by || "Agent"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>승인 대기 액션 없음</strong>
              <p>Agent가 실제 영향이 있는 액션을 제안하면 여기서 사람 승인을 기다립니다.</p>
            </div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>Recent Agent Runs</h2>
            <span>Execution History</span>
          </div>
          {runs?.length ? (
            <div className="hqList">
              {runs.map((run)=>(
                <div key={run.id}>
                  <b>{run.agent_name}</b>
                  <span>{run.status} · {run.summary || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>아직 Agent 실행 이력이 없습니다.</strong>
              <p>Inventory Agent부터 실제 실행이 기록됩니다.</p>
            </div>
          )}
        </article>
      </section>
    </HQShell>
  );
}
