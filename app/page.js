import HQShell from "./components/HQShell";

export const metadata = { title: "BIOTRIX HQ", robots: { index: false, follow: false } };

export default function Dashboard() {
  const cards = [
    ["오늘 매출","—","Commerce 연결 전"],
    ["오늘 주문","—","Commerce 연결 전"],
    ["재고 위험","—","Inventory Agent 준비"],
    ["승인 대기","—","Approval Queue 준비"],
  ];
  return (
    <HQShell active="Dashboard" title="Dashboard">
      <section className="hqCards">
        {cards.map(([label,value,sub]) => (
          <article className="hqMetric" key={label}>
            <div>{label}</div><strong>{value}</strong><span>{sub}</span>
          </article>
        ))}
      </section>

      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead"><h2>AI Agent Alerts</h2><span>0 active</span></div>
          <div className="hqEmpty">
            <strong>아직 실행 중인 Agent가 없습니다.</strong>
            <p>Commerce·Inventory·Finance 데이터를 연결하면 위험 신호와 제안이 이곳에 표시됩니다.</p>
          </div>
        </article>

        <article className="hqPanel">
          <div className="panelHead"><h2>Today</h2><span>Company Pulse</span></div>
          <div className="hqList">
            <div><b>Projects</b><span>프로젝트 DB 연결 완료</span></div>
            <div><b>Tasks</b><span>업무 DB 연결 완료</span></div>
            <div><b>Approvals</b><span>사람 승인 흐름 준비</span></div>
            <div><b>Agent Runs</b><span>AI 실행 이력 저장 준비</span></div>
          </div>
        </article>
      </section>

      <section className="hqPanel">
        <div className="panelHead"><h2>Operating Loop</h2><span>BIOTRIX AI-Native Model</span></div>
        <div className="loopRow">
          {["Observe","Analyze","Propose","Approve","Act","Learn"].map((x,i)=>(
            <div key={x}><small>0{i+1}</small><strong>{x}</strong></div>
          ))}
        </div>
      </section>
    </HQShell>
  );
}
