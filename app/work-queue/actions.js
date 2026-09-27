"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdmin(){
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if(!user) throw new Error("authentication_required");
  const { data:admin }=await supabase.from("admin_users").select("role,active").eq("auth_user_id",user.id).maybeSingle();
  if(!admin?.active) throw new Error("admin_required");
  return {supabase,user,admin};
}

export async function createWorkItem(formData){
  const {supabase}=await getAdmin();
  const opportunityId=String(formData.get("opportunity_id") || "").trim() || null;
  const missionId=String(formData.get("sourcing_mission_id") || "").trim() || null;

  await supabase.rpc("prepare_chatgpt_work_item",{
    p_department:String(formData.get("department") || "founder"),
    p_title:String(formData.get("title") || "").trim(),
    p_objective:String(formData.get("objective") || "").trim(),
    p_priority:String(formData.get("priority") || "medium"),
    p_opportunity_id:opportunityId,
    p_sourcing_mission_id:missionId,
  });

  revalidatePath("/work-queue");
}

export async function saveWorkResult(formData){
  const {supabase}=await getAdmin();
  const workItemId=String(formData.get("work_item_id") || "");
  const resultText=String(formData.get("result_text") || "").trim();
  if(!workItemId || !resultText) return;

  await supabase.from("chatgpt_work_results").insert({
    work_item_id:workItemId,
    result_text:resultText,
  });

  await supabase.from("chatgpt_work_items").update({
    status:"result_ready",
    updated_at:new Date().toISOString(),
  }).eq("id",workItemId);

  revalidatePath("/work-queue");
}

export async function acceptWorkResult(formData){
  const {supabase,user}=await getAdmin();
  const resultId=String(formData.get("result_id") || "");
  if(!resultId) return;

  const {data:result}=await supabase
    .from("chatgpt_work_results")
    .select("id,work_item_id,result_text,chatgpt_work_items(title,department)")
    .eq("id",resultId)
    .single();

  if(!result) return;

  await supabase.from("chatgpt_work_results").update({accepted:true}).eq("id",resultId);
  await supabase.from("chatgpt_work_items").update({
    status:"accepted",
    updated_at:new Date().toISOString(),
  }).eq("id",result.work_item_id);

  await supabase.from("documents").insert({
    title:`AI Work · ${result.chatgpt_work_items?.title || "Untitled"}`,
    category:`ai-${result.chatgpt_work_items?.department || "work"}`,
    content:result.result_text,
    tags:["chatgpt","accepted","work-queue"],
    created_by:user.id,
  });

  revalidatePath("/work-queue");
  revalidatePath("/knowledge");
}

export async function setWorkStatus(formData){
  const {supabase}=await getAdmin();
  const id=String(formData.get("id") || "");
  const status=String(formData.get("status") || "");
  const allowed=["prepared","in_progress","result_ready","accepted","archived","cancelled"];
  if(!id || !allowed.includes(status)) return;

  await supabase.from("chatgpt_work_items")
    .update({status,updated_at:new Date().toISOString()})
    .eq("id",id);

  revalidatePath("/work-queue");
}
