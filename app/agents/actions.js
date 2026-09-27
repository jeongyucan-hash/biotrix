"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdminContext() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, admin: null };

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return { supabase, user, admin };
}

export async function runInventoryAgent() {
  const { supabase, user, admin } = await getAdminContext();

  if (!user || !admin?.active) return;

  await supabase.rpc("run_inventory_agent");
  await supabase.rpc("refresh_operational_alerts");

  revalidatePath("/agents");
  revalidatePath("/");
}

async function reviewApproval(formData, decision) {
  const { supabase, user, admin } = await getAdminContext();

  if (!user || !admin?.active) return;

  const id = String(formData.get("id") || "");
  const note = String(formData.get("note") || "").trim();
  if (!id) return;

  await supabase.rpc("review_approval", {
    p_approval_id: id,
    p_decision: decision,
    p_note: note || null,
  });

  await supabase.rpc("refresh_operational_alerts");

  revalidatePath("/agents");
  revalidatePath("/procurement");
  revalidatePath("/");
}

export async function approveProposal(formData) {
  return reviewApproval(formData, "approved");
}

export async function rejectProposal(formData) {
  return reviewApproval(formData, "rejected");
}
