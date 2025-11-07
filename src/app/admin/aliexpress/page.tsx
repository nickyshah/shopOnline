"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AliExpressImportPage() {
  const [url, setUrl] = useState("");
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [externalId, setExternalId] = useState<string | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/aliexpress/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url || undefined, productId: productId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data.normalized);
      setExternalId(data.external_product_id || null);
      toast.success("Imported successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to import");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="relative mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Import from AliExpress</h1>

        <form onSubmit={handleImport} className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">AliExpress Product URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.aliexpress.com/item/..."
              className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white"
            />
          </div>
          <div className="text-center text-sm text-gray-500">or</div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">AliExpress Product ID</label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. 1005001234567890"
              className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || (!url && !productId)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import"}
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preview</div>
            <div className="text-gray-700 dark:text-gray-300 mb-2">{result.title}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Min ${(result.price_min_cents/100).toFixed(2)} {result.currency}{result.price_max_cents ? ` · Max ${(result.price_max_cents/100).toFixed(2)} ${result.currency}` : ""}</div>
            {Array.isArray(result.images) && result.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {result.images.slice(0,6).map((src: string) => (
                  <img key={src} src={src} alt="img" className="rounded" />
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                disabled={!externalId}
                onClick={async () => {
                  if (!externalId) return;
                  try {
                    const res = await fetch("/api/admin/aliexpress/publish", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ externalProductId: externalId, markupPercent: 0 }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Publish failed");
                    toast.success("Published to products");
                  } catch (e: any) {
                    toast.error(e.message || "Failed to publish");
                  }
                }}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl disabled:opacity-50"
              >
                Publish
              </button>
              <button
                disabled={!externalId}
                onClick={async () => {
                  if (!externalId) return;
                  try {
                    const res = await fetch("/api/admin/aliexpress/sync", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ externalProductId: externalId }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Sync failed");
                    setResult(data.normalized);
                    toast.success("Synced latest data");
                  } catch (e: any) {
                    toast.error(e.message || "Failed to sync");
                  }
                }}
                className="px-5 py-2 bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 text-gray-900 dark:text-white rounded-xl"
              >
                Sync
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


