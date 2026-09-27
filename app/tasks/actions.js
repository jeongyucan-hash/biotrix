"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("authentication_required");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin?.active) throw new Error("admin_required");
  return supabase;
}

export async function createTask(formData) {
  const supabase = await getAdminClient();
  const title = String(formData.get("title") || "").trim();
  const priority = String(formData.get("priority") || "medium");

  if (!title) return;

  await supabase.from("tasks").insert({
    title,
    priority,
    status: "todo",
  });

  revalidatePath("/tasks");
}

export async function updateTaskStatus(formData) {
  const supabase = await getAdminClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "todo");

  if (!["todo","in_progress","review","done"].includes(status)) return;

  await supabase.from("tasks").update({
    status,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  revalidatePath("/tasks");
}
