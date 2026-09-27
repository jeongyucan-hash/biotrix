import HQShell from "../components/HQShell";
export const metadata={title:"AI Agents · BIOTRIX HQ",robots:{index:false,follow:false}};
const agents=[
["CEO Agent","전사 KPI·리스크·우선순위 요약"],
["Commerce Agent","상품·매출·전환·고객 행동 분석"],
["Sourcing Agent","신규 상품·공급처 후보 탐색 및 검토"],
["Inventory Agent","재고 소진·안전재고·발주 제안"],
["CS Agent","문의 분류·답변 초안·반복 이슈 탐지"],
["Marketing Agent","콘텐츠·캠페인·광고 성과 분석"],
["Finance Agent","매출·원가·마진·현금흐름 분석"],
["Knowledge Agent","문서·결정·SOP 연결"],
];
export default function Agents(){return <HQShell active="AI Agents" title="AI Agents"><section className="agentGrid">{agents.map(([name,desc])=><article className="agentCard" key={name}><div className="agentStatus">PLANNED</div><h2>{name}</h2><p>{desc}</p><button>Configure</button></article>)}</section><section className="hqPanel"><div className="panelHead"><h2>Human Approval Queue</h2><span>AI → Approval → Action</span></div><div className="hqEmpty"><strong>승인 대기 액션 없음</strong><p>향후 발주, 가격 변경, 환불, 캠페인 집행처럼 실제 영향을 주는 액션은 여기서 사람 승인을 받은 뒤 실행됩니다.</p></div></section></HQShell>}