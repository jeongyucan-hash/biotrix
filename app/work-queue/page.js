import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import CopyButton from "./CopyButton";
import { acceptWorkResult, createWorkItem, saveWorkResult, setWorkStatus } from "./actions";

export const metadata={title:"Work Queue · BIOTRIX HQ",robots:{index:false,follow:false}};

export default async function WorkQueue(){
  const supabase=await createClient();

  const [itemsResult,resultsResult,oppsResult,missionsResult]=await Promise.all([
    supabase.from("chatgpt_work_items").select("*").order("updated_at",{ascending:false}).limit(50),
    supabase.from("chatgpt_work_results").select("*").order("created_at",{ascending:false}).limit(100),
    supabase.from("opportunities").select("id,title,status").order("updated_at",{ascending:false}).limit(50),
    supabase.from("sourcing_missions").select("id,title,status").order("updated_at",{ascending:false}).limit(50),
  ]);

  const items=itemsResult.data || [];
  const results=resultsResult.data || [];
  const opportunities=oppsResult.data || [];
  const missions=missionsResult.data || [];

  return (
    <HQShell active="Work Queue" title="ChatGPT Work Queue" eyebrow="CHATGPT-NATIVE OPERATIONS">
      <section className="hqGrid2">
        <article className="hqPanel">
          <div className="panelHead">
            <h2>Prepare AI Work</h2>
            <span>API 없이 ChatGPT/Work로 전달</span>
          </div>

          <form action={createWorkItem} className="stackForm">
            <input name="title" placeholder="업무명" required />
            <select name="department" defaultValue="sourcing">
              <option value="founder">Founder / Chief of Staff</option>
              <option value="sourcing">Sourcing</option>
              <option value="rd">R&D</option>
              <option value="marketing">Marketing / Growth</option>
              <option value="regulatory">Regulatory</option>
              <option value="operations">Operations</option>
              <option value="finance">Finance</option>
              <option value="advisory">Advisory</option>
              <option value="knowledge">Knowledge</option>
            </select>
            <select name="priority" defaultValue="medium">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select name="opportunity_id" defaultValue="">
              <option value="">Opportunity 연결 없음</option>
              {opportunities.map((o)=><option key={o.id} value={o.id}>{o.title} · {o.status}</option>)}
            </select>

            <select name="sourcing_mission_id" defaultValue="">
              <option value="">Sourcing Mission 연결 없음</option>
              {missions.map((m)=><option key={m.id} value={m.id}>{m.title} · {m.status}</option>)}
            </select>

            <textarea name="objective" rows="6" placeholder="ChatGPT/Work가 완료해야 할 결과를 명확히 적으세요." required />
            <button className="hqButton" type="submit">Work Packet 생성</button>
          </form>
        </article>

        <article className="hqPanel">
          <div className="panelHead">
            <h2>How it works</h2>
            <span>ChatGPT subscription first</span>
          </div>
          <div className="workflowSteps">
            <div><b>1</b><span>HQ에서 목표와 회사 컨텍스트를 묶어 Prompt Packet을 생성</span></div>
            <div><b>2</b><span>Copy prompt → ChatGPT 또는 Work에서 조사·분석·작성</span></div>
            <div><b>3</b><span>결과를 HQ에 붙여 넣고 검토</span></div>
            <div><b>4</b><span>Accept하면 Knowledge에 영구 저장</span></div>
          </div>
        </article>
      </section>

      <section className="hqPanel">
        <div className="panelHead">
          <h2>Queue</h2>
          <span>{items.length} item(s)</span>
        </div>

        {items.length ? (
          <div className="workQueue">
            {items.map((item)=>{
              const itemResults=results.filter((r)=>r.work_item_id===item.id);
              const latest=itemResults[0];

              return (
                <article className="workCard" id={`work-${item.id}`} key={item.id}>
                  <div className="workCardHead">
                    <div>
                      <div className="approvalMeta">
                        <span>{item.department}</span>
                        <span>{item.priority}</span>
                        <span>{item.status}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.objective}</p>
                    </div>
                    <CopyButton text={item.prompt_text} />
                  </div>

                  <details className="promptPacket">
                    <summary>Prompt Packet 보기</summary>
                    <pre>{item.prompt_text}</pre>
                  </details>

                  {!latest && item.status!=="cancelled" && (
                    <form action={saveWorkResult} className="resultForm">
                      <input type="hidden" name="work_item_id" value={item.id} />
                      <textarea name="result_text" rows="7" placeholder="ChatGPT/Work 결과를 여기에 붙여 넣으세요." required />
                      <button type="submit">결과 저장</button>
                    </form>
                  )}

                  {latest && (
                    <div className="workResult">
                      <div className="workResultHead">
                        <strong>{latest.accepted ? "Accepted result" : "Result ready"}</strong>
                        <span>{new Date(latest.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false }) + " KST"}</span>
                      </div>
                      <p>{latest.result_text}</p>
                      {!latest.accepted && (
                        <form action={acceptWorkResult}>
                          <input type="hidden" name="result_id" value={latest.id} />
                          <button className="acceptButton" type="submit">Accept → Knowledge 저장</button>
                        </form>
                      )}
                    </div>
                  )}

                  <form action={setWorkStatus} className="workStatusForm">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" defaultValue={item.status}>
                      <option value="prepared">Prepared</option>
                      <option value="in_progress">In progress</option>
                      <option value="result_ready">Result ready</option>
                      <option value="accepted">Accepted</option>
                      <option value="archived">Archived</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="submit">Status</button>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="hqEmpty">
            <strong>아직 AI Work Packet이 없습니다.</strong>
            <p>첫 업무를 생성하면 BIOTRIX의 컨텍스트가 포함된 프롬프트가 자동 생성됩니다.</p>
          </div>
        )}
      </section>
    </HQShell>
  );
}
