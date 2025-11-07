import crypto from "crypto";

type AliExpressConfig = {
  appKey: string;
  appSecret: string;
  pid?: string; // affiliate PID
};

export function getAliExpressConfig(): AliExpressConfig {
  const appKey = process.env.ALIEXPRESS_APP_KEY || "";
  const appSecret = process.env.ALIEXPRESS_APP_SECRET || "";
  const pid = process.env.ALIEXPRESS_AFFILIATE_PID || undefined;

  if (!appKey || !appSecret) {
    throw new Error("Missing AliExpress Affiliate API credentials. Set ALIEXPRESS_APP_KEY and ALIEXPRESS_APP_SECRET in .env.local");
  }

  return { appKey, appSecret, pid };
}

// NOTE: Placeholder signer; actual AE APIs require specific signing rules per endpoint.
function signParams(params: Record<string, any>, secret: string) {
  const sortedKeys = Object.keys(params).sort();
  const base = sortedKeys.map((k) => `${k}${params[k]}`).join("");
  const sign = crypto.createHash("md5").update(secret + base + secret).digest("hex").toUpperCase();
  return sign;
}

export async function fetchAliExpressProductById(productId: string) {
  const { appKey, appSecret, pid } = getAliExpressConfig();

  // This is a placeholder endpoint shape; integrate the real Affiliate API path you have access to.
  const method = "aliexpress.affiliate.productdetail.get";
  const params: Record<string, any> = {
    app_key: appKey,
    method,
    timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    sign_method: "md5",
    format: "json",
    product_ids: productId,
  };
  if (pid) params["pid"] = pid;

  const sign = signParams(params, appSecret);
  const query = new URLSearchParams({ ...params, sign }).toString();

  const apiUrl = process.env.ALIEXPRESS_API_BASE || "https://api-sg.aliexpress.com/some/affiliate/endpoint";
  const url = `${apiUrl}?${query}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AliExpress API error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data;
}

export function normalizeAliExpressProduct(raw: any) {
  // Highly dependent on actual API response; provide a robust, defensive parser
  const item = raw?.result?.result?.products?.[0] || raw?.data?.products?.[0] || raw?.product || {};
  const title = item?.productTitle || item?.title || "";
  const description = item?.productDescription || item?.description || "";
  const images: string[] = item?.imageList || item?.images || [];
  const priceMin = Math.round(((item?.targetSalePrice || item?.salePrice || 0) as number) * 100) || null;
  const priceMax = Math.round(((item?.targetOriginalPrice || item?.originalPrice || item?.salePrice || 0) as number) * 100) || priceMin;
  const currency = item?.currency || "USD";
  const sourceProductId = (item?.productId || item?.id || "").toString();

  // Variants (if available)
  const variants = (item?.skuList || item?.variants || []).map((v: any) => {
    const variantPrice = Math.round(((v?.salePrice || v?.price || 0) as number) * 100);
    return {
      variant_key: v?.skuAttr || v?.properties || v?.skuId || "",
      attributes: v?.attributes || v?.props || {},
      sku: v?.skuId || v?.sku || null,
      currency,
      price_cents: variantPrice || priceMin,
      stock: typeof v?.inventory === "number" ? v.inventory : null,
      raw_payload: v,
    };
  });

  return {
    source: "aliexpress",
    source_product_id: sourceProductId,
    title,
    description,
    images,
    currency,
    price_min_cents: priceMin,
    price_max_cents: priceMax,
    variants,
    raw: raw,
  };
}


