import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createDraftPO } from "./actions";

export const metadata={title:"Procurement · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0)) + "원";
}

export default async function Procurement(){
  const supabase=await createClient();

  const [poResult, approvalsResult]=await Promise.all([
    supabase
      .from("purchase_orders")
      .select("id,po_number,status,subtotal,notes,created_at,suppliers(name)")
      .order("created_at",{ascending:false})
      .limit(20),
    supabase
      .from("approvals")
      .select("id,title,description,payload,reviewed_at")
      .eq("status","approved")
      .eq("action_type","inventory_restock")
      .order("reviewed_at",{ascending:false})
      .limit(20),
  ]);

  const purchaseOrders=poResult.data || [];
  const approved=(approvalsResult.data || []).filter((item)=>!item.payload?.purchase_order_id);

  return (
    <HQShell active="Procurement" title="Procurement">
      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>Approved Restock Proposals</h2>
            <span>{approved.length} ready</span>
          </div>

          {approved.length ? (
            <div className="approvalList">
              {approved.map((item)=>(
                <article className="approvalCard" key={item.id}>
                  <div className="approvalMeta">
                    <span>APPROVED</span>
                    <span>{item.payload?.sku || "SKU —"}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="approvalFacts">
                    <span>가용재고 <b>{item.payload?.available_stock ?? "—"}</b></span>
                    <span>안전재고 <b>{item.payload?.safety_stock ?? "—"}</b></span>
                    <span>매입가 <b>{won(item.payload?.purchase_cost)}</b></span>
                  </div>
                  <form action={createDraftPO} className="inlineForm">
                    <input type="hidden" name="approval_id" value={item.id} />
                    <input name="quantity" type="number" min="1" step="1" placeholder="발주 수량" required />
                    <button className="hqButton" type="submit">Draft PO 생성</button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>Draft PO로 전환할 승인 제안이 없습니다.</strong>
              <p>Inventory Agent 제안을 승인하면 이곳에서 발주 수량을 확정할 수 있습니다.</p>
            </div>
          )}
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>Purchase Orders</h2>
            <span>{purchaseOrders.length} recent</span>
          </div>

          {purchaseOrders.length ? (
            <div className="poList">
              {purchaseOrders.map((po)=>(
                <div className="poRow" key={po.id}>
                  <div>
                    <strong>{po.po_number}</strong>
                    <span>{po.suppliers?.name || "Supplier"} · {po.status}</span>
                  </div>
                  <b>{won(po.subtotal)}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="hqEmpty">
              <strong>아직 발주서가 없습니다.</strong>
              <p>승인된 재고 보충안을 Draft PO로 전환하면 이력이 쌓입니다.</p>
            </div>
          )}
        </article>
      </section>
    </HQShell>
  );
}
