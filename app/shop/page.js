import Link from "next/link";
import { createPublicClient } from "../../lib/supabase/public";

export const metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

const categories = [
  ["Fresh", "과일·채소 등 신선식품"],
  ["Wellness", "일상 건강관리 제품"],
  ["Beauty", "기능·사용경험 기반 뷰티"],
];

function formatWon(value) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("ko-KR").format(Number(value)) + "원";
}

export default async function Shop() {
  const supabase = createPublicClient();
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      slug,
      name,
      category,
      brand,
      description,
      product_variants (
        id,
        option_name,
        retail_price,
        compare_at_price,
        active
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <>
      <header className="siteHeader">
        <nav className="container nav">
          <Link className="brand" href="/shop">BIOTRIX</Link>
          <div className="navLinks">
            <Link href="/shop">Shop</Link>
            <Link href="/account" className="chip">My</Link>
            <Link href="/cart" className="chip">Cart</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="container pageHead">
          <div className="eyebrow">SHOP</div>
          <h1>Curated for everyday life.</h1>
          <p className="muted">Fresh · Wellness · Beauty 카테고리의 BIOTRIX 상품을 소개합니다.</p>
        </section>

        <section className="container section">
          <div className="grid3">
            {categories.map(([name, desc]) => (
              <article className="card" key={name}>
                <div className="eyebrow">{name.toUpperCase()}</div>
                <h2>{name}</h2>
                <p className="muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container section">
          <h2 className="sectionTitle">New Arrivals</h2>
          {error ? (
            <div className="empty">
              <h3>상품 정보를 불러오지 못했습니다.</h3>
              <p className="muted">잠시 후 다시 확인해 주세요.</p>
            </div>
          ) : products?.length ? (
            <div className="grid3">
              {products.map((product) => {
                const variant = product.product_variants?.find((v) => v.active);
                return (
                  <article className="card productCard" key={product.id}>
                    <div className="productImage">상품 이미지</div>
                    <div className="productBody">
                      <small>{product.brand || product.category}</small>
                      <h3>{product.name}</h3>
                      <p className="muted">{product.description || "상품 상세정보 준비 중"}</p>
                      {variant?.retail_price !== undefined && (
                        <p><strong>{formatWon(variant.retail_price)}</strong></p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty">
              <h3>현재 등록된 판매 상품이 없습니다.</h3>
              <p className="muted">상품이 Admin에서 활성화되면 이 영역에 자동으로 노출됩니다.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
