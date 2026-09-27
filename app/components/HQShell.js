import Link from "next/link";

const items = [
  ["Dashboard","/"],
  ["Tasks","/tasks"],
  ["Commerce","/commerce"],
  ["Suppliers","/suppliers"],
  ["Finance","/finance"],
  ["Knowledge","/knowledge"],
  ["AI Agents","/agents"],
];

export default function HQShell({ active, title, eyebrow="BIOTRIX HQ", children }) {
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
          <span className="statusDot"></span> Supabase Connected
        </div>
      </aside>
      <main className="hqMain">
        <header className="hqTop">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
          </div>
          <div className="hqTopRight">
            <span className="hqBadge">Internal Preview</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
