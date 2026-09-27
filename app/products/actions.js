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

function numberOrZero(value){
  const n=Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function createProduct(formData){
  const supabase=await getAdminClient();

  const supplierRaw=String(formData.get("supplier_id") || "").trim();

  const payload={
    p_slug:String(formData.get("slug") || "").trim(),
    p_name:String(formData.get("name") || "").trim(),
    p_category:String(formData.get("category") || "fresh"),
    p_brand:String(formData.get("brand") || "").trim(),
    p_description:String(formData.get("description") || "").trim(),
    p_status:String(formData.get("status") || "draft"),
    p_supplier_id:supplierRaw || null,
    p_sku:String(formData.get("sku") || "").trim(),
    p_option_name:String(formData.get("option_name") || "").trim(),
    p_retail_price:numberOrZero(formData.get("retail_price")),
    p_purchase_cost:numberOrZero(formData.get("purchase_cost")),
    p_tax_type:String(formData.get("tax_type") || "taxable"),
    p_on_hand:Math.max(0,Math.trunc(numberOrZero(formData.get("on_hand")))),
    p_safety_stock:Math.max(0,Math.trunc(numberOrZero(formData.get("safety_stock")))),
  };

  if(!payload.p_slug || !payload.p_name || !payload.p_sku) return;

  await supabase.rpc("create_product_with_variant",payload);

  revalidatePath("/products");
  revalidatePath("/commerce");
  revalidatePath("/");
}

export async function updateInventory(formData){
  const supabase=await getAdminClient();

  const variantId=String(formData.get("variant_id") || "");
  const onHand=Math.max(0,Math.trunc(numberOrZero(formData.get("on_hand"))));
  const safetyStock=Math.max(0,Math.trunc(numberOrZero(formData.get("safety_stock"))));
  const note=String(formData.get("note") || "").trim();

  if(!variantId) return;

  await supabase.rpc("update_inventory_level",{
    p_variant_id:variantId,
    p_on_hand:onHand,
    p_safety_stock:safetyStock,
    p_note:note || null,
  });

  revalidatePath("/products");
  revalidatePath("/commerce");
  revalidatePath("/");
}

export async function updateProductStatus(formData){
  const supabase=await getAdminClient();
  const productId=String(formData.get("product_id") || "");
  const status=String(formData.get("status") || "draft");

  if(!productId || !["draft","active","archived"].includes(status)) return;

  await supabase.rpc("update_product_status",{
    p_product_id:productId,
    p_status:status,
  });

  revalidatePath("/products");
  revalidatePath("/commerce");
  revalidatePath("/");
}
