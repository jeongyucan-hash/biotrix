import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createOpportunity, postFounderMessage, updateOpportunity } from "./actions";

export const metadata={title:"Founder Room · BIOTRIX HQ",robots:{index:false,follow:false}};

const stanceLabel={
  support:"SUPPORT",
  concern:"CONCERN",
  oppose:"OPPOSE",
  needs_data:"NEEDS DATA",
};

export default async function FounderRoom(){
  const supabase=await createClient();

  const { data:room }=await supabase
    .from("agent_rooms")
    .select("id,code,name,purpose,active")
    .eq("code","founder-room")
    .single();

  const [
    membersResult,
    messagesResult,
    opportunitiesResult,
    reviewsResult,
    packetsResult,
    aiSettingResult,
  ]=await Promise.all([
    supabase
      .from("agent_room_members")
      .select(`
        agent_code,sort_order,role_label,can_challenge,
        agent_definitions(name,purpose,status,execution_mode,mandate)
      `)
      .eq("room_id",room.id)
      .order("sort_order"),
    supabase
      .from("agent_messages")
      .select("id,opportunity_id,author_type,agent_code,message_type,content,evidence,confidence,created_at")
      .eq("room_id",room.id)
      .order("created_at",{ascending:true})
      .limit(100),
    supabase
      .from("opportunities")
      .select("id,title,category,origin,summary,target_customer,target_channel,stage,status,updated_at")
      .order("updated_at",{ascending:false})
      .limit(30),
    supabase
      .from("opportunity_reviews")
      .select("id,opportunity_id,agent_code,stance,summary,risks,questions,created_at")
      .order("created_at",{ascending:false})
      .limit(50),
    supabase
      .from("decision_packets")
      .select("id,opportunity_id,title,status,agreements,disagreements,unknowns,proposed_actions,created_at")
      .eq("room_id",room.id)
      .order("created_at",{ascending:false})
      .limit(10),
    supabase
      .from("company_settings")
      .select("value")
      .eq("key","ai.enabled")
      .maybeSingle(),
  ]);

  const members=membersResult.data || [];
  const messages=messagesResult.data || [];
  const opportunities=opportunitiesResult.data || [];
  const reviews=reviewsResult.data || [];
  const packets=packetsResult.data || [];
  const aiEnabled=aiSettingResult.data?.value === true;

  const agentMap=Object.fromEntries(
    members.map((m)=>[m.agent_code,m.agent_definitions?.name || m.agent_code])
  );

  return (
    <HQShell active="Founder Room" title="Founder Room" eyebrow="BIOTRIX VENTURE TEAM">
      <section className="founderHeader">
        <div>
          <div className="founderTitleRow">
            <h2>{room.name}</h2>
            <span className={aiEnabled ? "runtimeOn" : "runtimeOff"}>
              AI {aiEnabled ? "ON" : "OFF"}
            </span>
          </div>
          <p>{room.purpose}</p>
        </div>
        <div className="founderRule">
          <strong>원칙</strong>
          <span>독립 검토 → 반론 → Red Team → 종합 → Founder 결정</span>
        </div>
      </section>

      <section className="founderLayout">
        <aside className="founderTeam">
          <div className="panelHead">
            <h2>Core Team</h2>
            <span>{members.length} agents</span>
          </div>

          <div className="teamList">
            {members.map((member)=>(
              <article className="teamMember" key={member.agent_code}>
                <div className="teamAvatar">{String(member.sort_order/10).padStart(2,"0")}</div>
                <div>
                  <strong>{member.agent_definitions?.name}</strong>
                  <span>{member.role_label}</span>
                  <p>{member.agent_definitions?.purpose}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <main className="founderChat">
          <div className="panelHead">
            <h2>Room</h2>
            <span>{messages.length} message(s)</span>
          </div>

          <div className="chatTimeline">
            {messages.length ? messages.map((message)=>{
              const isHuman=message.author_type==="human";
              const name=isHuman ? "Founder" : message.author_type==="system" ? "System" : (agentMap[message.agent_code] || message.agent_code);
              return (
                <article className={"chatMessage "+(isHuman ? "human" : "agent")} key={message.id}>
                  <div className="chatMessageHead">
                    <strong>{name}</strong>
                    <span>{message.message_type}</span>
                  </div>
                  <p>{message.content}</p>
                  <div className="chatMessageFoot">
                    <span>{new Date(message.created_at).toLocaleString("ko-KR")}</span>
                    {message.confidence!==null && <span>Confidence {message.confidence}%</span>}
                  </div>
                </article>
              );
            }) : (
              <div className="hqEmpty">
                <strong>Founder Room이 준비되었습니다.</strong>
                <p>아래에서 첫 기회를 만들거나 팀에 바로 메시지를 던져보세요.</p>
              </div>
            )}
          </div>

          <form action={postFounderMessage} className="founderComposer">
            <select name="opportunity_id" defaultValue="">
              <option value="">전체 Founder Room</option>
              {opportunities.filter((o)=>o.status==="open" || o.status==="hold").map((o)=>(
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
            <textarea
              name="content"
              rows="3"
              placeholder="예: 이번 주 안에 과일 위탁판매 후보 10개를 찾아서 시장성·마진·공급 안정성 관점에서 토론해."
              required
            />
            <div className="composerActions">
              <span>{aiEnabled ? "AI roundtable execution ready" : "현재는 기록 모드 · LLM 실행 OFF"}</span>
              <button className="hqButton" type="submit">Founder 메시지 보내기</button>
            </div>
          </form>
        </main>

        <aside className="founderOpportunities">
          <div className="panelHead">
            <h2>Opportunity Inbox</h2>
            <span>{opportunities.length}</span>
          </div>

          <details className="newOpportunity" open={opportunities.length===0}>
            <summary>+ New Opportunity</summary>
            <form action={createOpportunity} className="stackForm">
              <input name="title" placeholder="기회명 / 제품명" required />
              <input name="category" placeholder="카테고리" />
              <input name="origin" placeholder="발견 경로 / 공급처" />
              <input name="target_customer" placeholder="타깃 고객" />
              <input name="target_channel" placeholder="채널 (쿠팡, 네이버, B2B...)" />
              <textarea name="summary" rows="4" placeholder="왜 검토하는지, 현재 알고 있는 정보" />
              <button className="hqButton" type="submit">검토 안건 생성</button>
            </form>
          </details>

          <div className="opportunityList">
            {opportunities.map((opp)=>{
              const oppReviews=reviews.filter((r)=>r.opportunity_id===opp.id);
              const packet=packets.find((p)=>p.opportunity_id===opp.id);

              return (
                <article className="opportunityCard" key={opp.id}>
                  <div className="approvalMeta">
                    <span>{opp.stage}</span>
                    <span>{opp.status}</span>
                  </div>
                  <h3>{opp.title}</h3>
                  {opp.summary && <p>{opp.summary}</p>}
                  <div className="opportunityMeta">
                    <span>{opp.target_channel || "Channel TBD"}</span>
                    <span>{oppReviews.length} review(s)</span>
                  </div>

                  {oppReviews.length>0 && (
                    <div className="reviewMiniList">
                      {oppReviews.slice(0,3).map((review)=>(
                        <div key={review.id}>
                          <b>{agentMap[review.agent_code] || review.agent_code}</b>
                          <span>{stanceLabel[review.stance]}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {packet && <div className="decisionBadge">Decision packet · {packet.status}</div>}

                  <form action={updateOpportunity} className="opportunityControl">
                    <input type="hidden" name="id" value={opp.id} />
                    <select name="stage" defaultValue={opp.stage}>
                      <option value="discovery">Discovery</option>
                      <option value="screening">Screening</option>
                      <option value="validation">Validation</option>
                      <option value="decision">Decision</option>
                      <option value="execution">Execution</option>
                      <option value="learning">Learning</option>
                    </select>
                    <select name="status" defaultValue={opp.status}>
                      <option value="open">Open</option>
                      <option value="hold">Hold</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button type="submit">Update</button>
                  </form>
                </article>
              );
            })}
          </div>
        </aside>
      </section>
    </HQShell>
  );
}
