import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { fetchAliExpressProductById, normalizeAliExpressProduct } from "@/lib/aliexpress/client";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const { externalProductId } = await req.json();
    if (!externalProductId) {
      return NextResponse.json({ error: "externalProductId is required" }, { status: 400 });
    }

    const { data: ext } = await supabase
      .from("external_products")
      .select("id, source, raw_payload")
      .eq("id", externalProductId)
      .single();
    if (!ext) {
      return NextResponse.json({ error: "External product not found" }, { status: 404 });
    }

    // Attempt to grab productId from stored payload if not passed
    const pid = ext.raw_payload?.result?.result?.products?.[0]?.productId
      || ext.raw_payload?.product?.id
      || ext.raw_payload?.data?.products?.[0]?.productId;
    if (!pid) {
      return NextResponse.json({ error: "Cannot determine product id from payload; please re-import." }, { status: 422 });
    }

    const raw = await fetchAliExpressProductById(String(pid));
    const normalized = normalizeAliExpressProduct(raw);

    const { error: updErr } = await supabase
      .from("external_products")
      .update({
        title: normalized.title,
        description: normalized.description,
        images: normalized.images,
        currency: normalized.currency,
        price_min_cents: normalized.price_min_cents,
        price_max_cents: normalized.price_max_cents,
        raw_payload: normalized.raw,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", externalProductId);

    if (updErr) {
      console.error("[AE Sync] update error", updErr);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    await supabase.from("external_variants").delete().eq("external_product_id", externalProductId);
    if (normalized.variants?.length) {
      await supabase.from("external_variants").insert(
        normalized.variants.map((v: any) => ({
          external_product_id: externalProductId,
          variant_key: v.variant_key,
          attributes: v.attributes,
          sku: v.sku,
          currency: v.currency,
          price_cents: v.price_cents,
          stock: v.stock,
          raw_payload: v.raw_payload,
        }))
      );
    }

    await supabase.from("external_sync_logs").insert({
      source: "aliexpress",
      action: "sync",
      status: "success",
      meta: { external_product_id: externalProductId },
    });

    return NextResponse.json({ success: true, normalized });
  } catch (e: any) {
    console.error("[AE Sync] error", e);
    return NextResponse.json({ error: e.message || "Failed to sync external product" }, { status: 500 });
  }
}


