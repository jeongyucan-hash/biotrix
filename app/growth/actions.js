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
  if(value===null || value===undefined || value==="") return null;
  const n=Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createGrowthExperiment(formData){
  const {supabase,user}=await getAdmin();
  const title=String(formData.get("title") || "").trim();
  const channel=String(formData.get("channel") || "").trim();
  const hypothesis=String(formData.get("hypothesis") || "").trim();
  const metric=String(formData.get("metric") || "").trim();
  if(!title || !channel || !hypothesis || !metric) return;

  await supabase.from("growth_experiments").insert({
    title,
    opportunity_id:String(formData.get("opportunity_id") || "").trim() || null,
    product_id:String(formData.get("product_id") || "").trim() || null,
    channel,
    hypothesis,
    metric,
    target_value:num(formData.get("target_value")),
    budget:num(formData.get("budget")),
    start_date:String(formData.get("start_date") || "") || null,
    end_date:String(formData.get("end_date") || "") || null,
    notes:String(formData.get("notes") || "").trim() || null,
    created_by:user.id,
  });

  revalidatePath("/growth");
}

export async function updateGrowthExperiment(formData){
  const {supabase}=await getAdmin();
  const id=String(formData.get("id") || "");
  if(!id) return;

  await supabase.from("growth_experiments").update({
    status:String(formData.get("status") || "planned"),
    actual_value:num(formData.get("actual_value")),
    spend:num(formData.get("spend")),
    notes:String(formData.get("notes") || "").trim() || null,
    updated_at:new Date().toISOString(),
  }).eq("id",id);

  revalidatePath("/growth");
}
