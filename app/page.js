import HQShell from "./components/HQShell";
import { createClient } from "../lib/supabase/server";

export const metadata = { title: "BIOTRIX HQ", robots: { index: false, follow: false } };

export default async function Dashboard() {
  const supabase = await createClient();

  const [
    productsResult,
    ordersResult,
    inventoryResult,
    approvalsResult,
    runsResult,
  ] = await Promise.all([
    supabase.from("products").select("id",{count:"exact",head:true}).eq("status","active"),
    supabase.from("orders").select("id",{count:"exact",head:true}),
    supabase.from("inventory").select("on_hand,reserved,safety_stock"),
    supabase.from("approvals").select("id,title,requested_by,created_at",{count:"exact"}).eq("status","pending").order("created_at",{ascending:false}).limit(5),
    supabase.from("agent_runs").select("id,agent_name,status,summary,created_at").order("created_at",{ascending:false}).limit(5),
  ]);

  const inventoryRows=inventoryResult.data || [];
  const lowStock=inventoryRows.filter((row)=>Math.max((row.on_hand||0)-(row.reserved||0),0) <= (row.safety_stock||0)).length;

  const cards = [
    ["Active Products",String(productsResult.count || 0),"현재 판매중"],
    ["Orders",String(ordersResult.count || 0),"전체 주문"],
    ["Low Stock",String(lowStock),"Inventory Agent"],
    ["Pending Approvals",String(approvalsResult.count || 0),"Human Review"],
  ];

  return (
    <HQShell active="Dashboard" title="Dashboard">
      <section className="hqCards">
        {cards.map(([label,value,sub]) => (
          <article className="hqMetric" key={label}>
            <div>{label}</div><strong>{value}</strong><span>{sub}</span>
          </article>
        ))}
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead"><h2>AI Agent Alerts</h2><span>{approvalsResult.count || 0} pending</span></div>
          {approvalsResult.data?.length ? (
            <div className="hqList">
              {approvalsResult.data.map((item)=>(
                <div key={item.id}><b>{item.title}</b><span>{item.requested_by || "Agent"}</span></div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>현재 승인 대기 제안이 없습니다.</strong>
              <p>Agent가 실제 행동을 제안하면 이곳에 올라옵니다.</p>
            </div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead"><h2>Agent Activity</h2><span>Recent Runs</span></div>
          {runsResult.data?.length ? (
            <div className="hqList">
              {runsResult.data.map((run)=>(
                <div key={run.id}><b>{run.agent_name}</b><span>{run.status} · {run.summary || "—"}</span></div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>아직 Agent 실행 이력이 없습니다.</strong>
              <p>Inventory Agent가 첫 실행 이력을 만들게 됩니다.</p>
            </div>
          )}
        </article>
      </section>

      <section className="hqPanel">
        <div className="panelHead"><h2>Operating Loop</h2><span>BIOTRIX AI-Native Model</span></div>
        <div className="loopRow">
          {["Observe","Analyze","Propose","Approve","Act","Learn"].map((x,i)=>(
            <div key={x}><small>0{i+1}</small><strong>{x}</strong></div>
          ))}
        </div>
      </section>
    </HQShell>
  );
}
