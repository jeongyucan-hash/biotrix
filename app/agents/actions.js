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

  if (!user) return { ok: false, message: "로그인이 필요합니다." };
  if (!admin?.active) return { ok: false, message: "운영자 권한이 필요합니다." };

  const { data, error } = await supabase.rpc("run_inventory_agent");

  if (error) return { ok: false, message: "Inventory Agent 실행에 실패했습니다." };

  revalidatePath("/agents");
  revalidatePath("/");
  return { ok: true, message: String(data ?? 0) + "개의 승인 제안을 생성했습니다." };
}

async function reviewApproval(formData, nextStatus) {
  const { supabase, user, admin } = await getAdminContext();

  if (!user) return;
  if (!admin?.active) return;

  const id = String(formData.get("id") || "");
  if (!id) return;

  const { data: current } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();

  if (!current) return;

  const reviewedAt = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("approvals")
    .update({
      status: nextStatus,
      reviewed_at: reviewedAt,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error || !updated) return;

  await supabase.from("audit_logs").insert({
    admin_user_id: user.id,
    action: "approval_" + nextStatus,
    entity: "approvals",
    entity_id: id,
    before_json: current,
    after_json: updated,
  });

  revalidatePath("/agents");
  revalidatePath("/");
}

export async function approveProposal(formData) {
  return reviewApproval(formData, "approved");
}

export async function rejectProposal(formData) {
  return reviewApproval(formData, "rejected");
}
