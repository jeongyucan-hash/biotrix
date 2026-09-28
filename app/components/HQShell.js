import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

const sections = [
  ["운영 · 실행", [
    ["대시보드","/"],["통합 업무함","/tasks"],["Work Queue","/work-queue"],["작업 기록","/activity"],
    ["사이트 통합 관리","/sites"],["운영 콘솔","/admin"],
  ]],
  ["매출 · 공급망", [
    ["첫 판매 준비","/launch"],["공급처 거래","/sourcing/outreach"],["Commerce","/commerce"],["Products","/products"],["Sourcing","/sourcing"],
    ["Procurement","/procurement"],["Suppliers","/suppliers"],["Finance","/finance"],
  ]],
  ["성장 · 지식", [
    ["Growth","/growth"],["R&D","/rd"],["Advisory","/advisory"],["Knowledge","/knowledge"],["Scribe","/scribe"],
    ["홈페이지 디자인실","/design"],["디자인 학습","/learning"],["Founder Room","/founder-room"],["AI Agents","/agents"],
  ]],
  ["계정", [["설정","/admin/settings"],["비밀번호 설정","/account/security"]]],
];

function MenuSections({ active, role }) {
  return sections.map(([section, items]) => {
    const visible = items.filter(([label]) => label !== "설정" || role === "owner");
    if (!visible.length) return null;
    const current = active === "Tasks" ? "통합 업무함" : active;
    const matches = (label) => current === label || (current === "Dashboard" && label === "대시보드");
    const hasActivePage = visible.some(([label]) => matches(label));
    return <details className="hqMenuGroup" key={section} open={hasActivePage}>
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
      <aside className="hqSide">
        <div className="hqBrand">BIOTRIX ADMIN</div>
        <div className="hqSub">Company Operating System</div>

        <nav className="hqMenu" aria-label="어드민 메뉴">
          <MenuSections active={active} role={admin.role} />
        </nav>
        <details className="hqMobileNav">
          <summary>메뉴 열기</summary>
          <nav aria-label="어드민 모바일 메뉴"><MenuSections active={active} role={admin.role} /></nav>
        </details>

        <div className="hqSideFoot">
          <span className="statusDot"></span>
          {admin.role.toUpperCase()} · Supabase
        </div>
      </aside>

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
