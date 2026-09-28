import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

const sections = [
  ["운영", [
    ["사이트 통합 관리","/sites"],["홈페이지 디자인실","/design"],["운영 콘솔","/admin"],["작업 기록","/activity"],["Dashboard","/"],["통합 업무함","/tasks"],
    ["Work Queue","/work-queue"],["디자인 학습","/learning"],["Founder Room","/founder-room"],["AI Agents","/agents"],
  ]],
  ["커머스", [
    ["첫 판매 준비","/launch"],["공급처 거래","/sourcing/outreach"],["Commerce","/commerce"],["Products","/products"],["Sourcing","/sourcing"],
    ["Procurement","/procurement"],["Suppliers","/suppliers"],["Finance","/finance"],
  ]],
  ["기획 · 지식", [
    ["R&D","/rd"],["Growth","/growth"],["Advisory","/advisory"],["Knowledge","/knowledge"],
  ]],
  ["설정", [["설정","/admin/settings"],["비밀번호 설정","/account/security"]]],
];

function MenuSections({ active, role }) {
  return sections.map(([section, items]) => {
    const visible = items.filter(([label]) => label !== "설정" || role === "owner");
    if (!visible.length) return null;
    return <div className="hqMenuGroup" key={section}>
      <div className="hqMenuHeading">{section}</div>
      {visible.map(([label, href]) => (
        <Link key={label} href={href} className={(active === "Tasks" ? "통합 업무함" : active) === label ? "active" : ""}>{label}</Link>
      ))}
    </div>;
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
