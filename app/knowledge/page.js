import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createDecision, createDocument } from "./actions";

export const metadata={title:"Knowledge · BIOTRIX HQ",robots:{index:false,follow:false}};

export default async function Knowledge(){
  const supabase=await createClient();

  const [documentsResult,decisionsResult]=await Promise.all([
    supabase.from("documents").select("id,title,category,content,created_at").order("created_at",{ascending:false}).limit(12),
    supabase.from("decisions").select("id,title,context,decision,rationale,decided_at").order("decided_at",{ascending:false}).limit(12),
  ]);

  const documents=documentsResult.data || [];
  const decisions=decisionsResult.data || [];

  return (
    <HQShell active="Knowledge" title="Knowledge">
      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead"><h2>Second Brain</h2><span>{documents.length} recent</span></div>
          <form action={createDocument} className="stackForm">
            <input name="title" placeholder="문서 제목" required />
            <input name="category" placeholder="분류 (SOP, Sourcing, Meeting...)" />
            <textarea name="content" placeholder="핵심 내용 또는 메모" rows="5" required />
            <button className="hqButton" type="submit">+ Document</button>
          </form>

          <div className="knowledgeList">
            {documents.length ? documents.map((doc)=>(
              <article key={doc.id}>
                <div className="approvalMeta"><span>{doc.category || "General"}</span><span>{new Date(doc.created_at).toLocaleDateString("ko-KR")}</span></div>
                <h3>{doc.title}</h3>
                <p>{doc.content.length>180 ? doc.content.slice(0,180)+"…" : doc.content}</p>
              </article>
            )) : <div className="hqEmpty"><strong>아직 문서가 없습니다.</strong><p>운영 SOP와 회의·소싱 지식을 쌓기 시작하세요.</p></div>}
          </div>
        </article>

        <article className="hqPanel">
          <div className="panelHead"><h2>Decision Memory</h2><span>{decisions.length} recent</span></div>
          <form action={createDecision} className="stackForm">
            <input name="title" placeholder="의사결정 제목" required />
            <textarea name="context" placeholder="배경 / 문제" rows="3" />
            <textarea name="decision" placeholder="결정 내용" rows="3" required />
            <textarea name="rationale" placeholder="결정 근거" rows="3" />
            <button className="hqButton" type="submit">+ Decision</button>
          </form>

          <div className="knowledgeList">
            {decisions.length ? decisions.map((item)=>(
              <article key={item.id}>
                <div className="approvalMeta"><span>DECISION</span><span>{new Date(item.decided_at).toLocaleDateString("ko-KR")}</span></div>
                <h3>{item.title}</h3>
                <p><b>결정:</b> {item.decision}</p>
                {item.rationale && <p><b>근거:</b> {item.rationale}</p>}
              </article>
            )) : <div className="hqEmpty"><strong>아직 의사결정 기록이 없습니다.</strong><p>왜 그렇게 결정했는지 남기면 향후 AI가 과거 맥락을 활용할 수 있습니다.</p></div>}
          </div>
        </article>
      </section>
    </HQShell>
  );
}
