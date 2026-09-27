"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdmin(){
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if(!user) return null;

  const { data:admin }=await supabase
    .from("admin_users")
    .select("active")
    .eq("auth_user_id",user.id)
    .maybeSingle();

  if(!admin?.active) return null;
  return { supabase,user };
}

export async function createDocument(formData){
  const ctx=await getAdmin();
  if(!ctx) return;

  const title=String(formData.get("title") || "").trim();
  const category=String(formData.get("category") || "").trim();
  const content=String(formData.get("content") || "").trim();

  if(!title || !content) return;

  await ctx.supabase.from("documents").insert({
    title,
    category:category || null,
    content,
    created_by:ctx.user.id,
  });

  revalidatePath("/knowledge");
}

export async function createDecision(formData){
  const ctx=await getAdmin();
  if(!ctx) return;

  const title=String(formData.get("title") || "").trim();
  const context=String(formData.get("context") || "").trim();
  const decision=String(formData.get("decision") || "").trim();
  const rationale=String(formData.get("rationale") || "").trim();

  if(!title || !decision) return;

  await ctx.supabase.from("decisions").insert({
    title,
    context:context || null,
    decision,
    rationale:rationale || null,
    decided_by:ctx.user.id,
  });

  revalidatePath("/knowledge");
}
