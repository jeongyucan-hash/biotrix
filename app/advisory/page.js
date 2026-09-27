import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { acceptAdvisoryResponse, addAdvisoryResponse, createAdvisoryQuestion } from "./actions";

export const metadata={title:"Advisory · BIOTRIX HQ",robots:{index:false,follow:false}};

export default async function Advisory(){
  const supabase=await createClient();

  const [questionsResult,responsesResult,oppsResult,rdResult]=await Promise.all([
    supabase.from("advisory_questions").select("*").order("updated_at",{ascending:false}),
    supabase.from("advisory_responses").select("*").order("created_at",{ascending:false}),
    supabase.from("opportunities").select("id,title,status").order("updated_at",{ascending:false}).limit(50),
    supabase.from("rd_projects").select("id,name,stage,status").order("updated_at",{ascending:false}).limit(50),
  ]);

  const questions=questionsResult.data || [];
  const responses=responsesResult.data || [];
  const opportunities=oppsResult.data || [];
  const rdProjects=rdResult.data || [];

  return (
    <HQShell active="Advisory" title="Advisory Desk">
      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>New Question</h2>
            <span>모르는 것은 별도 큐로 분리</span>
          </div>

          <form action={createAdvisoryQuestion} className="stackForm">
            <input name="title" placeholder="질문 제목" required />
            <select name="domain" defaultValue="regulatory">
              <option value="regulatory">Regulatory</option>
              <option value="quality">Quality</option>
              <option value="legal">Legal</option>
              <option value="tax">Tax</option>
              <option value="finance">Finance</option>
              <option value="clinical">Clinical</option>
              <option value="technical">Technical</option>
              <option value="market">Market</option>
              <option value="operations">Operations</option>
              <option value="other">Other</option>
            </select>
            <select name="priority" defaultValue="medium">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <textarea name="question" rows="5" placeholder="정확히 무엇을 확인해야 하는가?" required />
            <textarea name="context" rows="4" placeholder="배경/제약조건/이미 확인한 사실" />
            <select name="opportunity_id" defaultValue="">
              <option value="">Opportunity 연결 없음</option>
              {opportunities.map((o)=><option key={o.id} value={o.id}>{o.title} · {o.status}</option>)}
            </select>
            <select name="rd_project_id" defaultValue="">
              <option value="">R&D Project 연결 없음</option>
              {rdProjects.map((r)=><option key={r.id} value={r.id}>{r.name} · {r.stage}</option>)}
            </select>
            <button className="hqButton" type="submit">Advisory Question 생성</button>
          </form>
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>Review Standard</h2>
            <span>근거 우선</span>
          </div>
          <div className="workflowSteps">
            <div><b>1</b><span>질문을 규제·법무·품질 등 정확한 도메인으로 분리</span></div>
            <div><b>2</b><span>ChatGPT 답변과 외부 전문가 답변을 같은 형식으로 저장</span></div>
            <div><b>3</b><span>확실한 사실과 해석·추정을 분리</span></div>
            <div><b>4</b><span>Accepted 답변만 Knowledge에 편입</span></div>
          </div>
        </article>
      </section>

      <section className="hqPanel">
        <div className="panelHead">
          <h2>Question Queue</h2>
          <span>{questions.length} question(s)</span>
        </div>

        {questions.length ? (
          <div className="advisoryList">
            {questions.map((q)=>{
              const answers=responses.filter((r)=>r.question_id===q.id);
              return (
                <article className="advisoryCard" key={q.id}>
                  <div className="approvalMeta">
                    <span>{q.domain}</span>
                    <span>{q.priority}</span>
                    <span>{q.status}</span>
                  </div>
                  <h3>{q.title}</h3>
                  <p className="questionText">{q.question}</p>
                  {q.context && <p>{q.context}</p>}

                  {answers.length>0 && (
                    <div className="answerList">
                      {answers.map((a)=>(
                        <div className="answerCard" key={a.id}>
                          <div><b>{a.responder}</b><span>{a.responder_type}{a.confidence ? ` · ${a.confidence}%` : ""}</span></div>
                          <p>{a.response}</p>
                          {a.accepted ? (
                            <span className="acceptedTag">Accepted</span>
                          ) : (
                            <form action={acceptAdvisoryResponse}>
                              <input type="hidden" name="response_id" value={a.id} />
                              <button className="acceptButton" type="submit">Accept → Knowledge</button>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <details className="newOpportunity">
                    <summary>+ 답변 추가</summary>
                    <form action={addAdvisoryResponse} className="stackForm">
                      <input type="hidden" name="question_id" value={q.id} />
                      <input name="responder" placeholder="답변자: ChatGPT / 변호사 / 세무사 / 전문가..." defaultValue="ChatGPT" />
                      <select name="responder_type" defaultValue="chatgpt">
                        <option value="chatgpt">ChatGPT</option>
                        <option value="external_expert">External expert</option>
                        <option value="internal">Internal</option>
                        <option value="source_document">Source document</option>
                      </select>
                      <input name="confidence" type="number" min="0" max="100" step="1" placeholder="Confidence 0-100" />
                      <textarea name="response" rows="7" placeholder="답변 및 핵심 근거" required />
                      <button className="hqButton" type="submit">답변 저장</button>
                    </form>
                  </details>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="hqEmpty">
            <strong>현재 Advisory Question이 없습니다.</strong>
            <p>불확실한 규제·품질·법무·세무·기술 이슈를 여기에서 분리해 검증하세요.</p>
          </div>
        )}
      </section>
    </HQShell>
  );
}
