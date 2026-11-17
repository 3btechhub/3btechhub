const allowedOrigins = new Set(["https://3btechhub.github.io"]);

function response(body: unknown, status: number, origin: string | null) {
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "apikey, authorization, content-type, x-client-info";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return new Response(JSON.stringify(body), {status,headers});
}

Deno.serve((request: Request) => {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigins.has(origin)) return response({error:"Origin not allowed."},403,null);
  if (request.method === "OPTIONS") return response({ok:true},204,origin);
  return response({error:"Visitor analytics is disabled."},410,origin);
});
