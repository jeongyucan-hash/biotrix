import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { approveProposal, rejectProposal, runInventoryAgent } from "./actions";

export const metadata={title:"AI Agents · BIOTRIX HQ",robots:{index:false,follow:false}};

export default async function Agents(){
  const supabase = await createClient();

  const [
    definitionsResult,
    approvalsResult,
    runsResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from("agent_definitions")
      .select("code,name,purpose,status,execution_mode,model_name,requires_human_approval")
      .order("name"),
    supabase
      .from("approvals")
      .select("id,action_type,title,description,requested_by,status,payload,created_at")
      .eq("status","pending")
      .order("created_at",{ascending:false})
      .limit(10),
    supabase
      .from("agent_runs")
      .select("id,agent_name,status,summary,model_name,input_tokens,output_tokens,estimated_cost_usd,created_at,completed_at")
      .order("created_at",{ascending:false})
      .limit(10),
    supabase
      .from("company_settings")
      .select("key,value")
      .in("key",["ai.enabled","ai.gateway","ai.model.default"]),
  ]);

  const definitions=definitionsResult.data || [];
  const approvals=approvalsResult.data || [];
  const runs=runsResult.data || [];
  const settings=Object.fromEntries((settingsResult.data || []).map((row)=>[row.key,row.value]));

  return (
    <HQShell active="AI Agents" title="AI Agents">
      <section className="hqPanel">
        <div className="panelHead">
          <h2>AI Runtime</h2>
          <span>{settings["ai.enabled"] === true ? "LLM enabled" : "LLM disabled"}</span>
        </div>
        <div className="hqList">
          <div><b>Gateway</b><span>{String(settings["ai.gateway"] || "vercel")}</span></div>
          <div><b>Default model</b><span>{settings["ai.model.default"] || "Not configured"}</span></div>
          <div><b>Human approval</b><span>Required for external-impact actions</span></div>
        </div>
      </section>

      <section className="agentGrid">
        {definitions.map((agent)=>(
          <article className="agentCard" key={agent.code}>
            <div className="agentStatus">{agent.status.toUpperCase()} · {agent.execution_mode.toUpperCase()}</div>
            <h2>{agent.name}</h2>
            <p>{agent.purpose}</p>
            {agent.code === "inventory" ? (
              <form action={runInventoryAgent}>
                <button type="submit">Run Inventory Agent</button>
              </form>
            ) : (
              <button disabled>{agent.model_name || "Configure later"}</button>
            )}
          </article>
        ))}
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>Human Approval Queue</h2>
            <span>{approvals.length} pending</span>
          </div>

          {approvals.length ? (
            <div className="approvalList">
              {approvals.map((item)=>(
                <article className="approvalCard" key={item.id}>
                  <div className="approvalMeta">
                    <span>{item.requested_by || "Agent"}</span>
                    <span>{item.action_type}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  {item.action_type === "inventory_restock" && (
                    <div className="approvalFacts">
                      <span>SKU <b>{item.payload?.sku || "—"}</b></span>
                      <span>가용재고 <b>{item.payload?.available_stock ?? "—"}</b></span>
                      <span>안전재고 <b>{item.payload?.safety_stock ?? "—"}</b></span>
                    </div>
                  )}

                  <form className="approvalNote">
                    <input name="note" placeholder="검토 메모 (선택)" />
                  </form>

                  <div className="approvalActions">
                    <form action={approveProposal}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="approveButton" type="submit">승인</button>
                    </form>
                    <form action={rejectProposal}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="rejectButton" type="submit">거절</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>승인 대기 액션 없음</strong>
              <p>Agent가 외부 영향이 있는 행동을 제안하면 이곳에서 사람 승인을 기다립니다.</p>
            </div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>Recent Agent Runs</h2>
            <span>Execution History</span>
          </div>

          {runs.length ? (
            <div className="hqList">
              {runs.map((run)=>(
                <div key={run.id}>
                  <b>{run.agent_name}</b>
                  <span>
                    {run.status} · {run.summary || "—"}
                    {run.model_name ? " · "+run.model_name : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>아직 Agent 실행 이력이 없습니다.</strong>
              <p>Inventory Agent부터 실행 trace가 쌓입니다.</p>
            </div>
          )}
        </article>
      </section>
    </HQShell>
  );
}
