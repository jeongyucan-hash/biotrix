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

function num(value){
  const n=Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createRDFromOpportunity(formData){
  const {supabase}=await getAdmin();
  const opportunityId=String(formData.get("opportunity_id") || "");
  if(!opportunityId) return;
  await supabase.rpc("promote_opportunity_to_rd",{p_opportunity_id:opportunityId});
  revalidatePath("/rd");
}

export async function createRDProject(formData){
  const {supabase,user}=await getAdmin();
  const name=String(formData.get("name") || "").trim();
  if(!name) return;

  await supabase.from("rd_projects").insert({
    name,
    hypothesis:String(formData.get("hypothesis") || "").trim() || null,
    target_customer:String(formData.get("target_customer") || "").trim() || null,
    target_problem:String(formData.get("target_problem") || "").trim() || null,
    target_launch_date:String(formData.get("target_launch_date") || "") || null,
    created_by:user.id,
  });

  revalidatePath("/rd");
}

export async function updateRDProject(formData){
  const {supabase}=await getAdmin();
  const id=String(formData.get("id") || "");
  const stage=String(formData.get("stage") || "concept");
  const status=String(formData.get("status") || "active");
  if(!id) return;

  await supabase.from("rd_projects").update({
    stage,status,updated_at:new Date().toISOString()
  }).eq("id",id);

  revalidatePath("/rd");
}

export async function addRequirement(formData){
  const {supabase}=await getAdmin();
  const projectId=String(formData.get("rd_project_id") || "");
  const requirement=String(formData.get("requirement") || "").trim();
  if(!projectId || !requirement) return;

  await supabase.from("rd_requirements").insert({
    rd_project_id:projectId,
    requirement_type:String(formData.get("requirement_type") || "customer"),
    requirement,
    target:String(formData.get("target") || "").trim() || null,
  });

  revalidatePath("/rd");
}

export async function addExperiment(formData){
  const {supabase}=await getAdmin();
  const projectId=String(formData.get("rd_project_id") || "");
  const title=String(formData.get("title") || "").trim();
  if(!projectId || !title) return;

  await supabase.from("rd_experiments").insert({
    rd_project_id:projectId,
    title,
    hypothesis:String(formData.get("hypothesis") || "").trim() || null,
    method:String(formData.get("method") || "").trim() || null,
    success_criteria:String(formData.get("success_criteria") || "").trim() || null,
    estimated_cost:num(formData.get("estimated_cost")),
  });

  revalidatePath("/rd");
}

export async function updateExperiment(formData){
  const {supabase}=await getAdmin();
  const id=String(formData.get("id") || "");
  const status=String(formData.get("status") || "planned");
  const result=String(formData.get("result") || "").trim() || null;
  if(!id) return;

  const payload={status,result};
  if(status==="running") payload.started_at=new Date().toISOString();
  if(["passed","failed","inconclusive"].includes(status)) payload.completed_at=new Date().toISOString();

  await supabase.from("rd_experiments").update(payload).eq("id",id);
  revalidatePath("/rd");
}
