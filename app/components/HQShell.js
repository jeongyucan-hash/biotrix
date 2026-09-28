import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

const sections = [
  ["실행", [["Work Queue","/work-queue"],["작업 기록","/activity"],["운영 콘솔","/admin"],["AI Agents","/agents"]]],
  ["판매 · 공급", [["첫 판매 준비","/launch"],["Commerce","/commerce"],["Products","/products"],["Sourcing","/sourcing"],["공급처 거래","/sourcing/outreach"],["Procurement","/procurement"],["Suppliers","/suppliers"]]],
  ["성장 · 재무", [["Growth","/growth"],["Finance","/finance"],["R&D","/rd"],["Advisory","/advisory"]]],
  ["콘텐츠 · 지식", [["Scribe","/scribe"],["Knowledge","/knowledge"],["홈페이지 디자인실","/design"],["디자인 학습","/learning"]]],
  ["시스템", [["사이트 통합 관리","/sites"],["Founder Room","/founder-room"],["설정","/admin/settings"],["비밀번호 설정","/account/security"]]],
];

function MenuSections({ active, role }) {
  return sections.map(([section, items]) => {
    const visible = items.filter(([label]) => label !== "설정" || role === "owner");
    if (!visible.length) return null;
    const current = active === "Tasks" ? "통합 업무함" : active;
    const matches = (label) => current === label || (current === "Dashboard" && label === "대시보드");
    const hasActivePage = visible.some(([label]) => matches(label));
    return <details className={`hqMenuGroup${hasActivePage ? " current" : ""}`} key={section}>
      <summary className="hqMenuHeading">{section}<span aria-hidden="true">⌄</span></summary>
      <div className="hqMenuItems">
        {visible.map(([label, href]) => (
          <Link key={label} href={href} className={matches(label) ? "active" : ""}>{label}</Link>
        ))}
      </div>
    </details>;
  });
}

export default async function HQShell({ active, title, eyebrow="BIOTRIX HQ", children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin?.active) redirect("/setup");

  return (
    <div className="hqShell">
      <header className="hqSiteHeader">
        <Link href="/" className="hqBrand" aria-label="BIOTRIX HQ 대시보드">BIOTRIX <span>HQ</span></Link>
        <nav className="hqMenu" aria-label="HQ 주요 메뉴">
          <Link href="/" className={`hqNavLink${active === "Dashboard" ? " active" : ""}`}>대시보드</Link>
          <Link href="/tasks" className={`hqNavLink${active === "Tasks" ? " active" : ""}`}>통합 업무함</Link>
          <MenuSections active={active} role={admin.role} />
        </nav>
        <details className="hqMobileNav">
          <summary>메뉴 열기</summary>
          <nav aria-label="HQ 모바일 메뉴">
            <Link href="/">대시보드</Link><Link href="/tasks">통합 업무함</Link>
            <MenuSections active={active} role={admin.role} />
          </nav>
        </details>
      </header>

      <main className="hqMain">
        <header className="hqTop">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
          </div>
          <div className="hqTopRight">
            <span className="hqBadge">{user.email}</span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
