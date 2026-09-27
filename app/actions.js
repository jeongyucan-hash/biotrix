"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("authentication_required");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin?.active) throw new Error("admin_required");
  return { supabase, user, admin };
}

export async function refreshManagementSnapshot() {
  const { supabase } = await getAdmin();

  await supabase.rpc("capture_kpi_snapshot");
  await supabase.rpc("refresh_operational_alerts");
  await supabase.rpc("generate_daily_brief");

  revalidatePath("/");
}

export async function reviewAlert(formData) {
  const { supabase } = await getAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id || !["acknowledged","resolved","dismissed"].includes(status)) return;

  await supabase.rpc("review_operational_alert", {
    p_alert_id: id,
    p_status: status,
  });

  revalidatePath("/");
}
