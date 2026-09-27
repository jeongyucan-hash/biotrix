import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";

export const metadata={title:"Commerce · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0)) + "원";
}

export default async function Commerce(){
  const supabase = await createClient();

  const [
    activeProductsResult,
    ordersResult,
    inventoryResult,
    paidOrdersResult,
  ] = await Promise.all([
    supabase.from("products").select("id",{count:"exact",head:true}).eq("status","active"),
    supabase.from("orders").select("id",{count:"exact",head:true}),
    supabase.from("inventory").select("on_hand,reserved,safety_stock"),
    supabase.from("orders").select("total,payment_status").eq("payment_status","paid"),
  ]);

  const inventoryRows=inventoryResult.data || [];
  const availableUnits=inventoryRows.reduce((sum,row)=>sum+Math.max((row.on_hand||0)-(row.reserved||0),0),0);
  const lowStock=inventoryRows.filter((row)=>Math.max((row.on_hand||0)-(row.reserved||0),0) <= (row.safety_stock||0)).length;
  const revenue=(paidOrdersResult.data || []).reduce((sum,row)=>sum+Number(row.total||0),0);

  return (
    <HQShell active="Commerce" title="Commerce">
      <section className="hqCards">
        <article className="hqMetric"><div>Active Products</div><strong>{activeProductsResult.count || 0}</strong><span>현재 판매중</span></article>
        <article className="hqMetric"><div>Orders</div><strong>{ordersResult.count || 0}</strong><span>전체 주문</span></article>
        <article className="hqMetric"><div>Available Units</div><strong>{availableUnits}</strong><span>저재고 SKU {lowStock}</span></article>
        <article className="hqMetric"><div>Paid Revenue</div><strong>{won(revenue)}</strong><span>결제완료 주문 합계</span></article>
      </section>

      <section className="hqPanel">
        <div className="panelHead">
          <h2>Commerce Control Center</h2>
          <a className="hqButton" href="/shop">Open Shop Preview</a>
        </div>
        <div className="hqList">
          <div><b>Products</b><span>상품·SKU·판매상태</span></div>
          <div><b>Inventory</b><span>가용재고 {availableUnits} · 위험 SKU {lowStock}</span></div>
          <div><b>Orders</b><span>{ordersResult.count || 0} orders</span></div>
          <div><b>Revenue</b><span>{won(revenue)}</span></div>
        </div>
      </section>
    </HQShell>
  );
}
