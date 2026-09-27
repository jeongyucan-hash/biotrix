import HQShell from "./components/HQShell";
import { createClient } from "../lib/supabase/server";
import { refreshManagementSnapshot, reviewAlert } from "./actions";

export const metadata = { title: "BIOTRIX HQ", robots: { index: false, follow: false } };

function won(value){
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0)) + "원";
}

export default async function Dashboard() {
  const supabase = await createClient();

  const [
    commerceResult,
    financeResult,
    briefResult,
    alertsResult,
    trendResult,
    runsResult,
  ] = await Promise.all([
    supabase.from("hq_commerce_summary").select("*").maybeSingle(),
    supabase.from("hq_finance_summary").select("*").maybeSingle(),
    supabase.from("daily_briefs").select("*").order("brief_date",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("operational_alerts").select("id,alert_type,severity,title,message,status,created_at").in("status",["open","acknowledged"]).order("created_at",{ascending:false}).limit(8),
    supabase.from("hq_kpi_trend_7d").select("*"),
    supabase.from("agent_runs").select("id,agent_name,status,summary,created_at").order("created_at",{ascending:false}).limit(6),
  ]);

  const commerce=commerceResult.data || {};
  const finance=financeResult.data || {};
  const brief=briefResult.data || null;
  const alerts=alertsResult.data || [];
  const trend=trendResult.data || [];
  const runs=runsResult.data || [];

  const cards = [
    ["Paid Revenue",won(commerce.paid_revenue),"결제완료 누계"],
    ["Orders",String(commerce.total_orders || 0),"전체 주문"],
    ["Low Stock",String(commerce.low_stock_variants || 0),"안전재고 이하"],
    ["Pending Approvals",String(commerce.pending_approvals || 0),"사람 검토 대기"],
  ];

  return (
    <HQShell active="Dashboard" title="Dashboard">
      <section className="hqCards">
        {cards.map(([label,value,sub]) => (
          <article className="hqMetric" key={label}>
            <div>{label}</div>
            <strong>{value}</strong>
            <span>{sub}</span>
          </article>
        ))}
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>Daily Management Brief</h2>
            <form action={refreshManagementSnapshot}>
              <button className="hqButton" type="submit">Refresh</button>
            </form>
          </div>

          {brief ? (
            <div className="briefBox">
              <div className="briefDate">{brief.brief_date}</div>
              <h3>{brief.title}</h3>
              <p>{brief.summary}</p>
              <div className="briefMetrics">
                <span>Revenue <b>{won(brief.kpi_json?.paid_revenue)}</b></span>
                <span>Low stock <b>{brief.kpi_json?.low_stock_variants ?? 0}</b></span>
                <span>Approvals <b>{brief.kpi_json?.pending_approvals ?? 0}</b></span>
                <span>Open PO <b>{brief.kpi_json?.open_purchase_orders ?? 0}</b></span>
              </div>
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>아직 Management Brief가 없습니다.</strong>
              <p>Refresh를 누르면 현재 운영 데이터를 기반으로 첫 브리프를 생성합니다.</p>
            </div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>Operational Alerts</h2>
            <span>{alerts.length} active</span>
          </div>

          {alerts.length ? (
            <div className="alertList">
              {alerts.map((alert)=>(
                <article className="alertCard" key={alert.id}>
                  <div className="approvalMeta">
                    <span>{alert.severity.toUpperCase()}</span>
                    <span>{alert.alert_type}</span>
                  </div>
                  <h3>{alert.title}</h3>
                  <p>{alert.message}</p>
                  <div className="approvalActions">
                    <form action={reviewAlert}>
                      <input type="hidden" name="id" value={alert.id} />
                      <input type="hidden" name="status" value="acknowledged" />
                      <button type="submit">확인</button>
                    </form>
                    <form action={reviewAlert}>
                      <input type="hidden" name="id" value={alert.id} />
                      <input type="hidden" name="status" value="resolved" />
                      <button type="submit">해결</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>현재 활성 운영 경고가 없습니다.</strong>
              <p>저재고, 승인 적체, Agent 실패 등이 자동 감지되면 여기에 표시됩니다.</p>
            </div>
          )}
        </article>
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>7-Day KPI History</h2>
            <span>{trend.length} snapshot(s)</span>
          </div>
          {trend.length ? (
            <div className="trendTable">
              <b>Date</b><b>Revenue</b><b>Orders</b><b>Low stock</b>
              {trend.map((row)=>(
                <>
                  <span key={row.snapshot_date+"d"}>{row.snapshot_date}</span>
                  <span key={row.snapshot_date+"r"}>{won(row.paid_revenue)}</span>
                  <span key={row.snapshot_date+"o"}>{row.total_orders}</span>
                  <span key={row.snapshot_date+"l"}>{row.low_stock_variants}</span>
                </>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>KPI 이력이 아직 없습니다.</strong>
              <p>Daily snapshot이 쌓이면 일별 추세가 나타납니다.</p>
            </div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead"><h2>Agent Activity</h2><span>Recent Runs</span></div>
          {runs.length ? (
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
              <p>Inventory Agent부터 실제 실행 이력이 쌓입니다.</p>
            </div>
          )}
        </article>
      </section>

      <section className="hqPanel">
        <div className="panelHead">
          <h2>Financial Pulse</h2>
          <span>Recorded operational data</span>
        </div>
        <div className="hqList">
          <div><b>Gross margin</b><span>{won(finance.item_gross_margin)}</span></div>
          <div><b>Recorded expenses</b><span>{won(finance.recorded_expenses)}</span></div>
          <div><b>Open procurement value</b><span>{won(finance.open_procurement_value)}</span></div>
        </div>
      </section>
    </HQShell>
  );
}
