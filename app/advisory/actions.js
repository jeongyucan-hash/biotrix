"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdmin(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) throw new Error("authentication_required");
  const {data:admin}=await supabase.from("admin_users").select("active").eq("auth_user_id",user.id).maybeSingle();
  if(!admin?.active) throw new Error("admin_required");
  return {supabase,user};
}

export async function createAdvisoryQuestion(formData){
  const {supabase,user}=await getAdmin();
  const title=String(formData.get("title") || "").trim();
  const question=String(formData.get("question") || "").trim();
  if(!title || !question) return;

  await supabase.from("advisory_questions").insert({
    title,
    domain:String(formData.get("domain") || "other"),
    question,
    context:String(formData.get("context") || "").trim() || null,
    opportunity_id:String(formData.get("opportunity_id") || "").trim() || null,
    rd_project_id:String(formData.get("rd_project_id") || "").trim() || null,
    priority:String(formData.get("priority") || "medium"),
    created_by:user.id,
  });

  revalidatePath("/advisory");
}

export async function addAdvisoryResponse(formData){
  const {supabase}=await getAdmin();
  const questionId=String(formData.get("question_id") || "");
  const response=String(formData.get("response") || "").trim();
  if(!questionId || !response) return;

  await supabase.from("advisory_responses").insert({
    question_id:questionId,
    responder:String(formData.get("responder") || "ChatGPT").trim() || "ChatGPT",
    responder_type:String(formData.get("responder_type") || "chatgpt"),
    response,
    confidence:Number(formData.get("confidence") || 0) || null,
  });

  await supabase.from("advisory_questions")
    .update({status:"answered",updated_at:new Date().toISOString()})
    .eq("id",questionId);

  revalidatePath("/advisory");
}

export async function acceptAdvisoryResponse(formData){
  const {supabase,user}=await getAdmin();
  const responseId=String(formData.get("response_id") || "");
  if(!responseId) return;

  const {data:response}=await supabase
    .from("advisory_responses")
    .select("id,question_id,response,responder,advisory_questions(title,domain,question)")
    .eq("id",responseId)
    .single();

  if(!response) return;

  await supabase.from("advisory_responses").update({accepted:true}).eq("id",responseId);
  await supabase.from("advisory_questions")
    .update({status:"accepted",updated_at:new Date().toISOString()})
    .eq("id",response.question_id);

  await supabase.from("documents").insert({
    title:`Advisory · ${response.advisory_questions?.title || "Answer"}`,
    category:`advisory-${response.advisory_questions?.domain || "other"}`,
    content:[
      `Question: ${response.advisory_questions?.question || ""}`,
      `Responder: ${response.responder}`,
      "",
      response.response,
    ].join("\n"),
    tags:["advisory","accepted"],
    created_by:user.id,
  });

  revalidatePath("/advisory");
  revalidatePath("/knowledge");
}
