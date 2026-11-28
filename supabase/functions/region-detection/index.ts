import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set(["https://3btechhub.github.io", "http://localhost:5173"]);
function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://3btechhub.github.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin"
  };
}
function response(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "GET" && req.method !== "POST") return response(req, { error: "Method not allowed" }, 405);
  const country = (
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    req.headers.get("x-vercel-ip-country") ||
    ""
  ).trim().toUpperCase();
  const mapping: Record<string, { region: string; slug: string }> = {
    BD: { region: "Bangladesh", slug: "bangladesh" },
    SA: { region: "Saudi Arabia", slug: "saudi-arabia" }
  };
  const resolved = mapping[country] || { region: "Global", slug: "global" };
  return response(req, { ...resolved, country: country || "unknown", source: country ? "edge-ip-country" : "global-fallback" });
});
