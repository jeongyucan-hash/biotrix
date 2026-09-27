import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="siteHeader">
        <nav className="container nav">
          <Link className="brand" href="/">BIOTRIX</Link>
          <div className="navLinks">
            <Link href="/shop">Shop</Link>
            <Link href="/account" className="chip">My</Link>
            <Link href="/cart" className="chip">Cart</Link>
          </div>
        </nav>
      </header>
      <main>
        <section className="container hero">
          <div className="eyebrow">BIOTRIX COMMERCE V2</div>
          <h1>브랜드와 쇼핑을<br/>하나의 경험으로.</h1>
          <p>현재 운영 중인 BIOTRIX 사이트를 기반으로 상품, 회원, 주문, 결제, 관리자 기능을 확장할 차세대 커머스 구조입니다.</p>
          <div className="actions">
            <Link className="btn btnPrimary" href="/shop">Shop Preview</Link>
            <Link className="btn" href="/admin">Admin Preview</Link>
          </div>
        </section>
        <section className="container section">
          <div className="grid3">
            <article className="card"><div className="eyebrow">01 · FRESH</div><h2>Fresh</h2><p className="muted">신선식품 큐레이션과 산지·공급처 연계.</p></article>
            <article className="card"><div className="eyebrow">02 · WELLNESS</div><h2>Wellness</h2><p className="muted">건강관리 제품과 반복구매 상품군.</p></article>
            <article className="card"><div className="eyebrow">03 · BEAUTY</div><h2>Beauty</h2><p className="muted">기능과 사용 경험을 고려한 뷰티 포트폴리오.</p></article>
          </div>
        </section>
      </main>
      <footer className="footer"><div className="container footerInner"><strong>BIOTRIX</strong><span>Commerce v2 Preview</span></div></footer>
    </>
  );
}
