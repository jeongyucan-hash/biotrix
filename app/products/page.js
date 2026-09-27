import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createProduct, updateInventory, updateProductStatus } from "./actions";

export const metadata={title:"Products · BIOTRIX HQ",robots:{index:false,follow:false}};

function won(value){
  return new Intl.NumberFormat("ko-KR").format(Number(value || 0)) + "원";
}

export default async function Products(){
  const supabase=await createClient();

  const [productsResult,suppliersResult]=await Promise.all([
    supabase
      .from("products")
      .select(`
        id,slug,name,category,brand,status,supplier_id,created_at,
        suppliers(name),
        product_variants(
          id,sku,option_name,retail_price,purchase_cost,tax_type,active,
          inventory(on_hand,reserved,safety_stock,updated_at)
        )
      `)
      .order("created_at",{ascending:false}),
    supabase.from("suppliers").select("id,name").order("name"),
  ]);

  const products=productsResult.data || [];
  const suppliers=suppliersResult.data || [];

  return (
    <HQShell active="Products" title="Products">
      <section className="hqPanel">
        <div className="panelHead">
          <h2>Add Product + SKU</h2>
          <span>상품·SKU·초기재고를 한 번에 생성</span>
        </div>

        <form action={createProduct} className="productCreateForm">
          <input name="name" placeholder="상품명" required />
          <input name="slug" placeholder="slug (예: apple-1kg)" required />
          <select name="category" defaultValue="fresh">
            <option value="fresh">Fresh</option>
            <option value="wellness">Wellness</option>
            <option value="beauty">Beauty</option>
          </select>

          <input name="brand" placeholder="브랜드" />
          <select name="supplier_id" defaultValue="">
            <option value="">공급처 미지정</option>
            {suppliers.map((supplier)=>(
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
          <select name="status" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>

          <input name="sku" placeholder="SKU" required />
          <input name="option_name" placeholder="옵션명 (예: 1kg)" />
          <select name="tax_type" defaultValue="taxable">
            <option value="taxable">과세</option>
            <option value="tax_free">면세</option>
          </select>

          <input name="retail_price" type="number" min="0" step="1" placeholder="판매가" required />
          <input name="purchase_cost" type="number" min="0" step="1" placeholder="매입가" />
          <input name="on_hand" type="number" min="0" step="1" placeholder="초기재고" />

          <input name="safety_stock" type="number" min="0" step="1" placeholder="안전재고" />
          <textarea name="description" rows="3" placeholder="상품 설명" />
          <button className="hqButton" type="submit">상품 생성</button>
        </form>
      </section>

      <section className="hqPanel">
        <div className="panelHead">
          <h2>Product Master</h2>
          <span>{products.length} product(s)</span>
        </div>

        {products.length ? (
          <div className="productMasterList">
            {products.map((product)=>(
              <article className="productMasterCard" key={product.id}>
                <div className="productMasterHead">
                  <div>
                    <div className="approvalMeta">
                      <span>{product.category}</span>
                      <span>{product.status}</span>
                    </div>
                    <h3>{product.name}</h3>
                    <p>{product.brand || "No brand"} · {product.suppliers?.name || "공급처 미지정"} · /{product.slug}</p>
                  </div>

                  <form action={updateProductStatus} className="statusForm">
                    <input type="hidden" name="product_id" value={product.id} />
                    <select name="status" defaultValue={product.status}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button type="submit">Update</button>
                  </form>
                </div>

                <div className="variantList">
                  {(product.product_variants || []).map((variant)=>{
                    const inv=Array.isArray(variant.inventory) ? variant.inventory[0] : variant.inventory;
                    const available=Math.max((inv?.on_hand || 0)-(inv?.reserved || 0),0);
                    const low=available <= (inv?.safety_stock || 0);

                    return (
                      <div className="variantRow" key={variant.id}>
                        <div className="variantSummary">
                          <strong>{variant.sku}</strong>
                          <span>{variant.option_name || "Default"} · 판매 {won(variant.retail_price)} · 원가 {won(variant.purchase_cost)}</span>
                        </div>

                        <div className={"stockBadge "+(low ? "low" : "")}>
                          가용 {available} / 안전 {inv?.safety_stock || 0}
                        </div>

                        <form action={updateInventory} className="inventoryForm">
                          <input type="hidden" name="variant_id" value={variant.id} />
                          <label>
                            현재고
                            <input name="on_hand" type="number" min={inv?.reserved || 0} step="1" defaultValue={inv?.on_hand || 0} required />
                          </label>
                          <label>
                            안전재고
                            <input name="safety_stock" type="number" min="0" step="1" defaultValue={inv?.safety_stock || 0} required />
                          </label>
                          <input name="note" placeholder="조정 사유 (선택)" />
                          <button type="submit">재고 저장</button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="hqEmpty">
            <strong>아직 등록된 상품이 없습니다.</strong>
            <p>첫 상품과 SKU를 등록하면 Commerce와 Inventory Agent가 즉시 같은 데이터를 사용합니다.</p>
          </div>
        )}
      </section>
    </HQShell>
  );
}
