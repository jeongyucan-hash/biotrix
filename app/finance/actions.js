"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

export async function createExpense(formData){
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if(!user) return;

  const { data:admin }=await supabase
    .from("admin_users")
    .select("active")
    .eq("auth_user_id",user.id)
    .maybeSingle();

  if(!admin?.active) return;

  const category=String(formData.get("category") || "").trim();
  const vendor=String(formData.get("vendor") || "").trim();
  const description=String(formData.get("description") || "").trim();
  const amount=Number(formData.get("amount") || 0);
  const incurredAt=String(formData.get("incurred_at") || "").trim();

  if(!category || !Number.isFinite(amount) || amount<0) return;

  await supabase.from("expenses").insert({
    category,
    vendor:vendor || null,
    description:description || null,
    amount,
    incurred_at:incurredAt || undefined,
  });

  revalidatePath("/finance");
  revalidatePath("/");
}
