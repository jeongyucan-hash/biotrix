import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

const items = [
  ["Dashboard","/"],
  ["Tasks","/tasks"],
  ["Commerce","/commerce"],
  ["Products","/products"],
  ["Procurement","/procurement"],
  ["Suppliers","/suppliers"],
  ["Finance","/finance"],
  ["Knowledge","/knowledge"],
  ["Founder Room","/founder-room"],
  ["AI Agents","/agents"],
];

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
        <div className="hqBrand">BIOTRIX HQ</div>
        <div className="hqSub">Company Operating System</div>

        <nav className="hqMenu">
          {items.map(([label, href]) => (
            <Link key={label} href={href} className={active===label ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>

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
