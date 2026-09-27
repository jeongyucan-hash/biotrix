"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdminContext(){
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if(!user) throw new Error("authentication_required");

  const { data:admin }=await supabase
    .from("admin_users")
    .select("role,active")
    .eq("auth_user_id",user.id)
    .maybeSingle();

  if(!admin?.active) throw new Error("admin_required");
  return { supabase,user,admin };
}

async function getFounderRoom(supabase){
  const { data:room }=await supabase
    .from("agent_rooms")
    .select("id")
    .eq("code","founder-room")
    .single();

  if(!room) throw new Error("founder_room_missing");
  return room;
}

export async function createOpportunity(formData){
  const { supabase,user }=await getAdminContext();
  const room=await getFounderRoom(supabase);

  const title=String(formData.get("title") || "").trim();
  const category=String(formData.get("category") || "").trim();
  const origin=String(formData.get("origin") || "").trim();
  const summary=String(formData.get("summary") || "").trim();
  const targetCustomer=String(formData.get("target_customer") || "").trim();
  const targetChannel=String(formData.get("target_channel") || "").trim();

  if(!title) return;

  const { data:opportunity }=await supabase
    .from("opportunities")
    .insert({
      title,
      category:category || null,
      origin:origin || null,
      summary:summary || null,
      target_customer:targetCustomer || null,
      target_channel:targetChannel || null,
      created_by:user.id,
    })
    .select("id")
    .single();

  if(opportunity){
    const content=[
      "새 기회 검토 요청: "+title,
      summary ? "요약: "+summary : "",
      targetCustomer ? "타깃 고객: "+targetCustomer : "",
      targetChannel ? "검토 채널: "+targetChannel : "",
    ].filter(Boolean).join("\n");

    await supabase.from("agent_messages").insert({
      room_id:room.id,
      opportunity_id:opportunity.id,
      author_type:"human",
      message_type:"prompt",
      content,
      created_by:user.id,
    });
  }

  revalidatePath("/founder-room");
}

export async function postFounderMessage(formData){
  const { supabase,user }=await getAdminContext();
  const room=await getFounderRoom(supabase);

  const content=String(formData.get("content") || "").trim();
  const opportunityId=String(formData.get("opportunity_id") || "").trim();

  if(!content) return;

  await supabase.from("agent_messages").insert({
    room_id:room.id,
    opportunity_id:opportunityId || null,
    author_type:"human",
    message_type:"prompt",
    content,
    created_by:user.id,
  });

  revalidatePath("/founder-room");
}

export async function updateOpportunity(formData){
  const { supabase }=await getAdminContext();
  const id=String(formData.get("id") || "");
  const stage=String(formData.get("stage") || "discovery");
  const status=String(formData.get("status") || "open");

  if(!id) return;

  const allowedStages=["discovery","screening","validation","decision","execution","learning"];
  const allowedStatus=["open","hold","approved","rejected","completed"];

  if(!allowedStages.includes(stage) || !allowedStatus.includes(status)) return;

  await supabase
    .from("opportunities")
    .update({stage,status,updated_at:new Date().toISOString()})
    .eq("id",id);

  revalidatePath("/founder-room");
}


export async function decidePacket(formData){
  const { supabase,admin }=await getAdminContext();
  if(admin.role!=="owner") throw new Error("owner_required");

  const packetId=String(formData.get("packet_id") || "");
  const decision=String(formData.get("decision") || "");
  const note=String(formData.get("note") || "").trim();

  if(!packetId || !["go","hold","kill","more_data"].includes(decision)) return;

  await supabase.rpc("decide_founder_packet",{
    p_packet_id:packetId,
    p_decision:decision,
    p_note:note || null,
  });

  revalidatePath("/founder-room");
  revalidatePath("/tasks");
  revalidatePath("/");
}


export async function updateAIRuntime(formData){
  const { supabase,admin }=await getAdminContext();
  if(admin.role!=="owner") throw new Error("owner_required");

  const enabled=String(formData.get("enabled") || "false")==="true";
  const maxCost=Number(formData.get("max_cost_usd") || 0);

  if(!Number.isFinite(maxCost) || maxCost<0 || maxCost>25) return;

  await supabase.rpc("set_ai_runtime_control",{
    p_enabled:enabled,
    p_max_cost_usd:maxCost,
  });

  revalidatePath("/founder-room");
}
