"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdmin(){
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

function num(value){
  const n=Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createMission(formData){
  const { supabase,user }=await getAdmin();

  const title=String(formData.get("title") || "").trim();
  const brief=String(formData.get("brief") || "").trim();
  const category=String(formData.get("category") || "").trim();
  const targetCustomer=String(formData.get("target_customer") || "").trim();
  const channels=String(formData.get("target_channels") || "")
    .split(",").map((x)=>x.trim()).filter(Boolean);

  if(!title || !brief) return;

  await supabase.from("sourcing_missions").insert({
    title,
    category:category || null,
    brief,
    target_customer:targetCustomer || null,
    target_channels:channels,
    target_retail_price:num(formData.get("target_retail_price")),
    target_gross_margin_pct:num(formData.get("target_gross_margin_pct")),
    max_initial_cash:num(formData.get("max_initial_cash")),
    created_by:user.id,
  });

  revalidatePath("/sourcing");
}

export async function addCandidate(formData){
  const { supabase }=await getAdmin();

  const missionId=String(formData.get("mission_id") || "");
  const name=String(formData.get("name") || "").trim();
  if(!missionId || !name) return;

  const purchasePrice=num(formData.get("purchase_price"));
  const targetRetail=num(formData.get("target_retail_price"));

  const margin=(purchasePrice!==null && targetRetail!==null && targetRetail>0)
    ? ((targetRetail-purchasePrice)/targetRetail)*100
    : null;

  await supabase.from("sourcing_candidates").insert({
    mission_id:missionId,
    candidate_type:String(formData.get("candidate_type") || "product"),
    name,
    source_name:String(formData.get("source_name") || "").trim() || null,
    source_url:String(formData.get("source_url") || "").trim() || null,
    category:String(formData.get("category") || "").trim() || null,
    product_summary:String(formData.get("product_summary") || "").trim() || null,
    purchase_price:purchasePrice,
    moq:num(formData.get("moq")),
    lead_time_days:num(formData.get("lead_time_days")),
    settlement_terms:String(formData.get("settlement_terms") || "").trim() || null,
    supplier_name:String(formData.get("supplier_name") || "").trim() || null,
    supplier_contact:String(formData.get("supplier_contact") || "").trim() || null,
    target_retail_price:targetRetail,
    estimated_gross_margin_pct:margin,
    supply_risk:String(formData.get("supply_risk") || "unknown"),
    evidence_status:String(formData.get("evidence_status") || "unverified"),
    notes:String(formData.get("notes") || "").trim() || null,
  });

  revalidatePath("/sourcing");
}

export async function updateCandidateStatus(formData){
  const { supabase }=await getAdmin();

  const id=String(formData.get("id") || "");
  const status=String(formData.get("status") || "");
  const allowed=["discovered","researching","screening","shortlisted","rejected","promoted"];
  if(!id || !allowed.includes(status)) return;

  await supabase
    .from("sourcing_candidates")
    .update({status,updated_at:new Date().toISOString()})
    .eq("id",id);

  revalidatePath("/sourcing");
}

export async function promoteCandidate(formData){
  const { supabase }=await getAdmin();
  const id=String(formData.get("candidate_id") || "");
  if(!id) return;

  await supabase.rpc("promote_sourcing_candidate",{p_candidate_id:id});

  revalidatePath("/sourcing");
  revalidatePath("/founder-room");
}


export async function prepareResearchJob(formData){
  const { supabase }=await getAdmin();
  const missionId=String(formData.get("mission_id") || "");
  if(!missionId) return;

  await supabase.rpc("prepare_sourcing_research_job",{p_mission_id:missionId});

  revalidatePath("/sourcing");
}
