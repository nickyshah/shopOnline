import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    const { externalProductId, markupPercent } = await req.json();

    if (!externalProductId) {
      return NextResponse.json({ error: "externalProductId is required" }, { status: 400 });
    }

    // Load external product and variants
    const { data: ext } = await supabase
      .from("external_products")
      .select("id, title, description, images, currency, price_min_cents, price_max_cents")
      .eq("id", externalProductId)
      .single();

    if (!ext) {
      return NextResponse.json({ error: "External product not found" }, { status: 404 });
    }

    let price = ext.price_min_cents || 0;
    const markup = typeof markupPercent === "number" ? markupPercent : 0;
    if (markup > 0) {
      price = Math.round(price * (1 + markup / 100));
    }

    const imageUrl = Array.isArray(ext.images) && ext.images.length > 0 ? ext.images[0] : null;

    // Insert into local products
    const { data: product, error: insertErr } = await supabase
      .from("products")
      .insert({
        name: ext.title?.slice(0, 180) || "AliExpress Product",
        description: ext.description || null,
        image_url: imageUrl,
        price_cents: price,
        active: true,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[AE Publish] insert product error", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Optionally: record linkage in logs
    await supabase.from("external_sync_logs").insert({
      source: "aliexpress",
      action: "publish",
      status: "success",
      meta: { external_product_id: externalProductId, product_id: product.id, markup_percent: markup },
    });

    return NextResponse.json({ success: true, productId: product.id });
  } catch (e: any) {
    console.error("[AE Publish] error", e);
    return NextResponse.json({ error: e.message || "Failed to publish" }, { status: 500 });
  }
}


