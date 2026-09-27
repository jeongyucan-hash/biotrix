"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

export async function createSupplier(formData){
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if(!user) return;

  const { data:admin }=await supabase
    .from("admin_users")
    .select("active")
    .eq("auth_user_id",user.id)
    .maybeSingle();

  if(!admin?.active) return;

  const name=String(formData.get("name") || "").trim();
  const contactName=String(formData.get("contact_name") || "").trim();
  const phone=String(formData.get("phone") || "").trim();
  const email=String(formData.get("email") || "").trim();
  const settlement=String(formData.get("settlement_terms") || "").trim();

  if(!name) return;

  await supabase.from("suppliers").insert({
    name,
    contact_name:contactName || null,
    phone:phone || null,
    email:email || null,
    settlement_terms:settlement || null,
  });

  revalidatePath("/suppliers");
}
