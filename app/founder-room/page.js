import HQShell from "../components/HQShell";
import { createClient } from "../../lib/supabase/server";
import { createOpportunity, decidePacket, postFounderMessage, updateAIRuntime, updateOpportunity } from "./actions";
import { runFounderRoundtable } from "./roundtable";

export const metadata={title:"Founder Room · BIOTRIX HQ",robots:{index:false,follow:false}};
export const maxDuration=300;

const stanceLabel={
  support:"SUPPORT",
  concern:"CONCERN",
  oppose:"OPPOSE",
  needs_data:"NEEDS DATA",
};

function usd(value){
  return "$"+Number(value || 0).toFixed(4);
}

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
    runsResult,
    settingsResult,
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
      .limit(200),
    supabase
      .from("opportunities")
      .select("id,title,category,origin,summary,target_customer,target_channel,stage,status,updated_at")
      .order("updated_at",{ascending:false})
      .limit(30),
    supabase
      .from("opportunity_reviews")
      .select("id,opportunity_id,agent_code,stance,summary,risks,questions,created_at")
      .order("created_at",{ascending:false})
      .limit(100),
    supabase
      .from("decision_packets")
      .select("id,opportunity_id,title,status,agreements,disagreements,unknowns,proposed_actions,recommendation,recommendation_rationale,founder_decision,founder_note,created_at,decided_at")
      .eq("room_id",room.id)
      .order("created_at",{ascending:false})
      .limit(30),
    supabase
      .from("founder_room_runs")
      .select("id,opportunity_id,status,mode,specialist_model,red_team_model,synthesis_model,calls_used,input_tokens,output_tokens,estimated_cost_usd,error_message,created_at,completed_at")
      .eq("room_id",room.id)
      .order("created_at",{ascending:false})
      .limit(30),
    supabase
      .from("company_settings")
      .select("key,value")
      .in("key",[
        "ai.enabled",
        "founder_room.mode",
        "founder_room.model.specialist",
        "founder_room.model.red_team",
        "founder_room.model.synthesis",
        "founder_room.max_calls",
        "founder_room.max_estimated_cost_usd",
      ]),
  ]);

  const members=membersResult.data || [];
  const messages=messagesResult.data || [];
  const opportunities=opportunitiesResult.data || [];
  const reviews=reviewsResult.data || [];
  const packets=packetsResult.data || [];
  const runs=runsResult.data || [];
  const settings=Object.fromEntries((settingsResult.data || []).map((row)=>[row.key,row.value]));
  const aiEnabled=settings["ai.enabled"]===true;
  const gatewayAuthAvailable=Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

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
          <strong>ROUND TABLE</strong>
          <span>독립검토 6 → Cross-check 3 → Red Team → Chief Synthesis → Founder Decision</span>
        </div>
      </section>

      <section className="runtimeStrip">
        <div><span>Mode</span><b>{String(settings["founder_room.mode"] || "standard")}</b></div>
        <div><span>Specialists</span><b>{String(settings["founder_room.model.specialist"] || "—")}</b></div>
        <div><span>Red Team</span><b>{String(settings["founder_room.model.red_team"] || "—")}</b></div>
        <div><span>Chief</span><b>{String(settings["founder_room.model.synthesis"] || "—")}</b></div>
        <div><span>Call cap</span><b>{String(settings["founder_room.max_calls"] || 11)}</b></div>
        <div><span>Cost cap</span><b>{usd(settings["founder_room.max_estimated_cost_usd"] || 2)}</b></div>
      </section>

      <details className="aiRuntimeControl">
        <summary>AI Runtime Control · owner only</summary>
        <form action={updateAIRuntime}>
          <div>
            <label>Runtime</label>
            <select name="enabled" defaultValue={aiEnabled ? "true" : "false"}>
              <option value="false">OFF — 모델 호출 금지</option>
              <option value="true">ON — Founder Room 모델 호출 허용</option>
            </select>
          </div>
          <div>
            <label>회의 1회 비용 상한 (USD)</label>
            <input
              name="max_cost_usd"
              type="number"
              min="0"
              max="25"
              step="0.10"
              defaultValue={Number(settings["founder_room.max_estimated_cost_usd"] || 2)}
              required
            />
          </div>
          <div className="runtimeAuthState">
            <span>Gateway auth</span>
            <b>{gatewayAuthAvailable ? "AVAILABLE" : "NOT DETECTED"}</b>
          </div>
          <button type="submit">Runtime 설정 저장</button>
        </form>
        <p>ON으로 변경한 뒤부터만 실제 AI Gateway 호출이 발생합니다. 외부 실행은 별도 사람 승인 체계를 그대로 유지합니다.</p>
      </details>

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
                  <span>{member.role_label} · {member.agent_definitions?.execution_mode}</span>
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
                <p>오른쪽에서 첫 Opportunity를 만들고 Roundtable을 실행하세요.</p>
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
              placeholder="Founder가 팀 전체에 남길 추가 지시, 가정, 질문을 입력"
              required
            />
            <div className="composerActions">
              <span>{aiEnabled ? "AI Roundtable 실행 가능" : "기록 가능 · 유료 AI 실행은 아직 OFF"}</span>
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
              const latestRun=runs.find((r)=>r.opportunity_id===opp.id);

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

                  {latestRun && (
                    <div className={"runStatus "+latestRun.status}>
                      <div><b>Latest run</b><span>{latestRun.status}</span></div>
                      <div><span>{latestRun.calls_used} calls</span><span>{usd(latestRun.estimated_cost_usd)}</span></div>
                      {latestRun.error_message && <p>{latestRun.error_message}</p>}
                    </div>
                  )}

                  {oppReviews.length>0 && (
                    <div className="reviewMiniList">
                      {oppReviews.slice(0,6).map((review)=>(
                        <div key={review.id}>
                          <b>{agentMap[review.agent_code] || review.agent_code}</b>
                          <span>{stanceLabel[review.stance]}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!packet && (
                    <form action={runFounderRoundtable} className="roundtableAction">
                      <input type="hidden" name="opportunity_id" value={opp.id} />
                      <button type="submit" disabled={!aiEnabled || latestRun?.status==="running"}>
                        {aiEnabled ? "Run 8-Agent Roundtable" : "AI Runtime OFF"}
                      </button>
                    </form>
                  )}

                  {packet && (
                    <div className="decisionPacketMini">
                      <div className="decisionBadge">
                        Decision Packet · {packet.status}
                      </div>
                      <div className="packetRecommendation">
                        <span>AI recommendation</span>
                        <strong>{packet.recommendation?.toUpperCase() || "—"}</strong>
                      </div>
                      <p>{packet.recommendation_rationale}</p>

                      {!!packet.disagreements?.length && (
                        <div className="packetList">
                          <b>남은 이견</b>
                          {packet.disagreements.slice(0,3).map((item,index)=><span key={index}>{item}</span>)}
                        </div>
                      )}

                      {!!packet.unknowns?.length && (
                        <div className="packetList">
                          <b>미확인</b>
                          {packet.unknowns.slice(0,3).map((item,index)=><span key={index}>{item}</span>)}
                        </div>
                      )}

                      {packet.founder_decision ? (
                        <div className="founderDecisionDone">
                          Founder decision · <b>{packet.founder_decision.toUpperCase()}</b>
                        </div>
                      ) : (
                        <form action={decidePacket} className="founderDecisionForm">
                          <input type="hidden" name="packet_id" value={packet.id} />
                          <select name="decision" defaultValue="more_data">
                            <option value="go">GO — 실행</option>
                            <option value="more_data">MORE DATA — 추가 검증</option>
                            <option value="hold">HOLD — 보류</option>
                            <option value="kill">KILL — 종료</option>
                          </select>
                          <input name="note" placeholder="Founder 메모 (선택)" />
                          <button type="submit">Founder 결정 확정</button>
                        </form>
                      )}
                    </div>
                  )}

                  <details className="manualControl">
                    <summary>Manual status</summary>
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
                  </details>
                </article>
              );
            })}
          </div>
        </aside>
      </section>
    </HQShell>
  );
}
