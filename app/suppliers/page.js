import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createSupplier } from "./actions";

export const metadata={title:"Suppliers · BIOTRIX HQ",robots:{index:false,follow:false}};

export default async function Suppliers(){
  const supabase=await createClient();

  const { data:suppliers }=await supabase
    .from("suppliers")
    .select("id,name,business_number,contact_name,phone,email,settlement_terms,created_at")
    .order("created_at",{ascending:false});

  const rows=suppliers || [];

  return (
    <HQShell active="Suppliers" title="Suppliers">
      <section className="hqPanel">
        <div className="panelHead">
          <h2>Add Supplier</h2>
          <span>Supplier Master</span>
        </div>

        <form action={createSupplier} className="dataForm">
          <input name="name" placeholder="공급처명" required />
          <input name="contact_name" placeholder="담당자" />
          <input name="phone" placeholder="전화번호" />
          <input name="email" type="email" placeholder="이메일" />
          <input name="settlement_terms" placeholder="정산조건" />
          <button className="hqButton" type="submit">+ Supplier</button>
        </form>
      </section>

      <section className="hqPanel">
        <div className="panelHead">
          <h2>Supplier Network</h2>
          <span>{rows.length} supplier(s)</span>
        </div>

        {rows.length ? (
          <div className="supplierTable">
            <b>공급처</b><b>담당자</b><b>연락처</b><b>정산조건</b>
            {rows.map((supplier)=>(
              <>
                <span key={supplier.id+"n"}>{supplier.name}</span>
                <span key={supplier.id+"c"}>{supplier.contact_name || "—"}</span>
                <span key={supplier.id+"p"}>{supplier.phone || supplier.email || "—"}</span>
                <span key={supplier.id+"s"}>{supplier.settlement_terms || "—"}</span>
              </>
            ))}
          </div>
        ) : (
          <div className="hqEmpty">
            <strong>등록된 공급처가 없습니다.</strong>
            <p>상품 소싱이 시작되면 공급처 마스터를 여기서 관리합니다.</p>
          </div>
        )}
      </section>
    </HQShell>
  );
}
