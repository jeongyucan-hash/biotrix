import Link from "next/link";
import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";

export const metadata = { title: "운영 콘솔 | BIOTRIX ADMIN", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const groups = [
  {
    title: "운영 · 의사결정",
    items: [
      ["Dashboard", "/", "경영 지표와 오늘의 브리프"],
      ["Tasks", "/tasks", "업무 등록과 진행 상태"],
      ["작업 기록", "/activity", "코드 변경·검수·배포 이력"],
      ["Founder Room", "/founder-room", "기회 검토와 다부서 토론"],
      ["AI Agents", "/agents", "에이전트 실행과 승인"],
      ["Work Queue", "/work-queue", "AI 업무 요청과 결과 검수"],
    ],
  },
  {
    title: "커머스 · 공급",
    items: [
      ["Commerce", "/commerce", "주문·매출·채널 현황"],
      ["Products", "/products", "상품 등록과 재고"],
      ["Sourcing", "/sourcing", "소싱 후보와 검증"],
      ["Procurement", "/procurement", "발주와 입고"],
      ["Suppliers", "/suppliers", "공급사 관리"],
      ["Finance", "/finance", "원가·비용·손익"],
    ],
  },
  {
    title: "성장 · 지식",
    items: [
      ["R&D", "/rd", "제품 개발 단계와 실험"],
      ["Growth", "/growth", "마케팅 실험"],
      ["Advisory", "/advisory", "전문가 검토와 답변"],
      ["Knowledge", "/knowledge", "채택된 결과와 문서"],
    ],
  },
];

export default async function AdminConsole() {
  const db = await createClient();
  const [
    tasks, approvals, work, opportunities, products, settings, admins,
  ] = await Promise.all([
    db.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
    db.from("approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    db.from("chatgpt_work_items").select("*", { count: "exact", head: true })
      .in("status", ["prepared", "in_progress", "result_ready"]),
    db.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "open"),
    db.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
    db.from("company_settings").select("key,value").in("key", ["ai.enabled", "ai.model.default"]),
    db.auth.getUser(),
  ]);
  const userId = admins.data?.user?.id;
  const { data: role } = userId
    ? await db.from("admin_users").select("role").eq("auth_user_id", userId).maybeSingle()
    : { data: null };
  const aiConfig = Object.fromEntries((settings.data || []).map(({ key, value }) => [key, value]));
  const aiReady = aiConfig["ai.enabled"] === true && Boolean(aiConfig["ai.model.default"]) &&
    Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
  const metrics = [
    ["진행 중 업무", tasks.count, "/tasks"],
    ["승인 대기", approvals.count, "/agents"],
    ["AI 업무 대기", work.count, "/work-queue"],
    ["검토 중 기회", opportunities.count, "/founder-room"],
  ];

  return (
    <HQShell active="운영 콘솔" title="운영 콘솔" eyebrow="BIOTRIX ADMIN">
      <section className="consoleMetrics" aria-label="현재 작업 현황">
        {metrics.map(([label, count, href]) => (
          <Link href={href} className="consoleMetric" key={label}>
            <span>{label}</span><strong>{count ?? "—"}</strong><small>열기 →</small>
          </Link>
        ))}
      </section>

      <section className="consoleFocus hqPanel">
        <div>
          <div className="eyebrow">TODAY'S WORKSPACE</div>
          <h2>바로 이어서 할 일</h2>
          <p>업무를 만들고, 검토 결과를 기록하고, 실행이 필요한 안건을 승인하세요.</p>
        </div>
        <div className="consoleFocusLinks">
          <Link className="hqButton" href="/tasks">업무 등록</Link>
          <Link className="hqButton" href="/founder-room">회의실 열기</Link>
          <Link className="hqButton" href="/agents">승인 검토</Link>
        </div>
      </section>

      <div className="consoleGroups">
        {groups.map(group => <section className="hqPanel consoleGroup" key={group.title}>
          <div className="panelHead"><h2>{group.title}</h2><span>{group.items.length}개 기능</span></div>
          <div className="consoleModuleList">
            {group.items.map(([label, href, description]) => (
              <Link href={href} key={href}><span><strong>{label}</strong><small>{description}</small></span><span aria-hidden="true">↗</span></Link>
            ))}
          </div>
        </section>)}
      </div>

      <section className="hqPanel consoleSystem">
        <div className="panelHead"><h2>시스템 연결</h2><span>현재 설정</span></div>
        <div className="consoleSystemGrid">
          <div><strong>커머스 상품</strong><span>판매 중 {products.count ?? "—"}개</span></div>
          <div><strong>AI 실행</strong><span>{aiReady ? "사이트 내 실행 가능" : "설정 또는 인증 대기"}</span></div>
          <div><strong>Work Queue</strong><span>프롬프트 전달·결과 검수 방식</span></div>
          {role?.role === "owner" && <Link href="/admin/settings"><strong>계정 · 메일링</strong><span>운영자와 메일 초안 관리 ↗</span></Link>}
        </div>
      </section>
    </HQShell>
  );
}
