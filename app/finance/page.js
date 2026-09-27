import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createExpense } from "./actions";

export const metadata={title:"Finance · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0)) + "원";
}

export default async function Finance(){
  const supabase=await createClient();

  const [summaryResult,channelsResult,expensesResult]=await Promise.all([
    supabase.from("hq_finance_summary").select("*").maybeSingle(),
    supabase.from("hq_channel_summary").select("*").order("paid_revenue",{ascending:false}),
    supabase.from("expenses").select("id,category,vendor,description,amount,incurred_at").order("incurred_at",{ascending:false}).limit(12),
  ]);

  const summary=summaryResult.data || {};
  const channels=channelsResult.data || [];
  const expenses=expensesResult.data || [];

  return (
    <HQShell active="Finance" title="Finance">
      <section className="hqCards">
        <article className="hqMetric"><div>Paid Revenue</div><strong>{won(summary.paid_revenue)}</strong><span>결제완료 주문</span></article>
        <article className="hqMetric"><div>Item COGS</div><strong>{won(summary.item_cogs)}</strong><span>주문 원가 스냅샷</span></article>
        <article className="hqMetric"><div>Gross Margin</div><strong>{won(summary.item_gross_margin)}</strong><span>상품 기준</span></article>
        <article className="hqMetric"><div>Recorded Expenses</div><strong>{won(summary.recorded_expenses)}</strong><span>입력된 비용</span></article>
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead"><h2>Channel Revenue</h2><span>Paid orders</span></div>
          {channels.length ? (
            <div className="hqList">
              {channels.map((row)=>(
                <div key={row.channel_code}>
                  <b>{row.channel_code}</b>
                  <span>{row.paid_orders} orders · {won(row.paid_revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty"><strong>채널 매출 데이터가 없습니다.</strong><p>주문이 유입되면 Direct·Coupang·Naver·B2B를 비교합니다.</p></div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead"><h2>Expense Entry</h2><span>Manual ledger</span></div>
          <form action={createExpense} className="dataForm compact">
            <input name="category" placeholder="비용 분류" required />
            <input name="vendor" placeholder="거래처" />
            <input name="description" placeholder="내용" />
            <input name="amount" type="number" min="0" step="1" placeholder="금액" required />
            <input name="incurred_at" type="date" />
            <button className="hqButton" type="submit">+ Expense</button>
          </form>
        </article>
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead"><h2>Recent Expenses</h2><span>{expenses.length} recent</span></div>
          {expenses.length ? (
            <div className="hqList">
              {expenses.map((row)=>(
                <div key={row.id}>
                  <b>{row.category} · {row.vendor || "—"}</b>
                  <span>{row.incurred_at} · {won(row.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty"><strong>기록된 비용이 없습니다.</strong><p>광고비·배송비·SaaS·외주비 등을 입력하면 손익 분석에 반영됩니다.</p></div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead"><h2>Procurement Exposure</h2><span>Open commitments</span></div>
          <div className="financeHero">
            <strong>{won(summary.open_procurement_value)}</strong>
            <span>취소되지 않은 발주서 기준</span>
          </div>
        </article>
      </section>
    </HQShell>
  );
}
