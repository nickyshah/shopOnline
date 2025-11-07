import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { fetchAliExpressProductById, normalizeAliExpressProduct } from "@/lib/aliexpress/client";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const { productId, url } = await req.json();

    let id = productId as string | undefined;
    if (!id && url) {
      // naive extraction: try to parse product id from URL
      const m = (url as string).match(/(\d{6,})/);
      if (m) id = m[1];
    }
    if (!id) {
      return NextResponse.json({ error: "Provide productId or valid AliExpress URL" }, { status: 400 });
    }

    const raw = await fetchAliExpressProductById(id);
    const normalized = normalizeAliExpressProduct(raw);
    if (!normalized.source_product_id) {
      return NextResponse.json({ error: "Failed to parse product from AliExpress response" }, { status: 422 });
    }

    // upsert into external_products
    const { data: ext, error: upsertErr } = await supabase
      .from("external_products")
      .upsert({
        source: "aliexpress",
        source_product_id: normalized.source_product_id,
        original_url: url || null,
        title: normalized.title,
        description: normalized.description,
        images: normalized.images,
        currency: normalized.currency,
        price_min_cents: normalized.price_min_cents,
        price_max_cents: normalized.price_max_cents,
        raw_payload: normalized.raw,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: "source,source_product_id" })
      .select("id")
      .single();

    if (upsertErr) {
      console.error("[AE Import] upsert error", upsertErr);
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    // replace variants
    await supabase.from("external_variants").delete().eq("external_product_id", ext.id);
    if (normalized.variants?.length) {
      await supabase.from("external_variants").insert(
        normalized.variants.map((v: any) => ({
          external_product_id: ext.id,
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

    return NextResponse.json({ success: true, external_product_id: ext.id, normalized });
  } catch (e: any) {
    console.error("[AE Import] error", e);
    return NextResponse.json({ error: e.message || "Failed to import AliExpress product" }, { status: 500 });
  }
}


