"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

async function getAdminClient(){
  const supabase=await createClient();
  const { data:{ user } }=await supabase.auth.getUser();
  if(!user) throw new Error("authentication_required");

  const { data:admin }=await supabase
    .from("admin_users")
    .select("active")
    .eq("auth_user_id",user.id)
    .maybeSingle();

  if(!admin?.active) throw new Error("admin_required");
  return supabase;
}

export async function createDraftPO(formData){
  const supabase=await getAdminClient();
  const approvalId=String(formData.get("approval_id") || "");
  const quantity=Number(formData.get("quantity") || 0);

  if(!approvalId || !Number.isInteger(quantity) || quantity<=0) return;

  await supabase.rpc("create_draft_po_from_inventory_approval",{
    p_approval_id:approvalId,
    p_quantity:quantity,
  });

  revalidatePath("/procurement");
  revalidatePath("/agents");
  revalidatePath("/");
}
