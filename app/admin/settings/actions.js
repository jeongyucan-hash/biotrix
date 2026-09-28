"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "../../../lib/supabase/server";

const ROLES = ["owner", "manager", "cs", "logistics", "analyst"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function ownerContext() {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: admin, error } = await db.from("admin_users")
    .select("role,active").eq("auth_user_id", user.id).maybeSingle();
  if (error || !admin?.active) redirect("/setup");
  if (admin.role !== "owner") redirect("/");
  return { db, user };
}

async function audit(db, userId, action, entity, entityId, before, after) {
  const { error } = await db.from("audit_logs").insert({
    admin_user_id: userId, action, entity, entity_id: entityId,
    before_json: before, after_json: after,
  });
  if (error) console.error("Admin audit insert failed:", error.code);
}

function finish(code) {
  revalidatePath("/admin/settings");
  redirect("/admin/settings?notice=" + encodeURIComponent(code));
}

export async function updateOperator(formData) {
  const { db, user } = await ownerContext();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "");
  const active = String(formData.get("active")) === "true";
  if (!UUID.test(id) || !ROLES.includes(role)) finish("invalid");
  if (id === user.id && (!active || role !== "owner")) finish("self");
  const { data: before, error: readError } = await db.from("admin_users")
    .select("auth_user_id,role,active").eq("auth_user_id", id).maybeSingle();
  if (readError || !before) finish("missing");
  if (before.role === "owner" && (role !== "owner" || !active)) {
    const { count, error } = await db.from("admin_users")
      .select("*", { count: "exact", head: true }).eq("role", "owner").eq("active", true);
    if (error || count <= 1) finish("last-owner");
  }
  if (before.role === role && before.active === active) finish("unchanged");
  const { error } = await db.from("admin_users").update({ role, active })
    .eq("auth_user_id", id);
  if (error) finish("save-failed");
  await audit(db, user.id, "operator.update", "admin_users", id,
    { role: before.role, active: before.active }, { role, active });
  finish("operator-saved");
}

export async function inviteOperator(formData) {
  const { db, user } = await ownerContext();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !ROLES.includes(role)) finish("invalid");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) finish("invite-unavailable");

  // The privileged client only issues the invitation. Role assignment uses
  // the signed-in owner's RLS-protected session.
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qmhqdjxmpatncobkozkr.supabase.co",
    key, { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || "https://hq.biotrix.co.kr") + "/auth/callback",
  });
  if (error || !data?.user?.id) finish("invite-failed");
  const { error: roleError } = await db.from("admin_users")
    .upsert({ auth_user_id: data.user.id, role, active: true });
  if (roleError) {
    console.error("Operator role assignment failed:", roleError.code);
    finish("invite-role-failed");
  }
  await audit(db, user.id, "operator.invite", "admin_users", data.user.id, null,
    { email, role, active: true });
  finish("invited");
}

export async function saveMailingDraft(formData) {
  const { db, user } = await ownerContext();
  const subject = String(formData.get("subject") || "").trim();
  const previewText = String(formData.get("preview_text") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!subject || subject.length > 160 || previewText.length > 200 ||
      !body || body.length > 20000) finish("invalid");
  const { data, error } = await db.from("mailing_drafts").insert({
    subject, preview_text: previewText, body, created_by: user.id,
  }).select("id").single();
  if (error) {
    console.error("Mailing draft creation failed:", error.code);
    finish("save-failed");
  }
  await audit(db, user.id, "mailing.draft_create", "mailing_drafts", data.id,
    null, { subject, audience: "consented_customers" });
  finish("draft-saved");
}
