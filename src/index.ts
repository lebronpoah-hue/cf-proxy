export interface Env {}

const SEARCH_BASES = new Map<string, string>([
  ["google", "https://www.google.com/search?q="],
  ["bing", "https://www.bing.com/search?q="],
  ["duckduckgo", "https://duckduckgo.com/?q="],
]);

function jsonResponse(
  payload: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  for (const [name, value] of Object.entries(extraHeaders)) {
    headers.set(name, value);
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405, { Allow: "GET" });
    }

    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/api/health") {
      return jsonResponse({
        ok: true,
        service: "games-page-api",
        endpoints: ["GET /api/health", "GET /api/search-url?engine=google&q=term"],
      });
    }

    if (url.pathname === "/api/search-url") {
      const query = (url.searchParams.get("q") || "").trim();
      const engine = (url.searchParams.get("engine") || "").trim().toLowerCase();
      const base = SEARCH_BASES.get(engine);

      if (!query || query.length > 500) {
        return jsonResponse({ error: "Query must be between 1 and 500 characters" }, 400);
      }
      if (!base) {
        return jsonResponse({ error: "Unsupported search engine" }, 400);
      }

      return jsonResponse({ url: base + encodeURIComponent(query) });
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
