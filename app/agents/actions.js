"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

export async function runInventoryAgent() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다." };

  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin?.active) return { ok: false, message: "운영자 권한이 필요합니다." };

  const { data, error } = await supabase.rpc("run_inventory_agent");

  if (error) return { ok: false, message: "Inventory Agent 실행에 실패했습니다." };

  revalidatePath("/agents");
  return { ok: true, message: String(data ?? 0) + "개의 승인 제안을 생성했습니다." };
}
