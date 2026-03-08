import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
};

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function extractRealUrl(href: string): string {
  try {
    // DuckDuckGo redirect format: /l/?uddg=<encoded-url>
    if (href.startsWith("/l/?")) {
      const full = new URL(`https://html.duckduckgo.com${href}`);
      const uddg = full.searchParams.get("uddg");
      if (uddg) return decodeURIComponent(uddg);
    }

    if (href.startsWith("http://") || href.startsWith("https://")) {
      return href;
    }
  } catch {
    // ignore
  }

  return "";
}

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^\[?::1\]?$/.test(hostname) ||
      /^\[?fc[0-9a-f]{0,2}:/i.test(hostname) ||
      /^\[?fd[0-9a-f]{0,2}:/i.test(hostname) ||
      /^\[?fe80:/i.test(hostname)
    ) {
      return false;
    }

    return url.protocol === "https:";
  } catch {
    return false;
  }
}

async function searchWeb(query: string): Promise<SearchResult[]> {
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(`Search provider failed with status ${response.status}`);
  }

  const html = await response.text();
  const results: SearchResult[] = [];

  const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match: RegExpExecArray | null;

  while ((match = resultRegex.exec(html)) && results.length < 10) {
    const realUrl = extractRealUrl(match[1]);
    if (!realUrl || !isAllowedUrl(realUrl)) continue;

    const title = decodeHtml(match[2]);
    const snippet = decodeHtml(match[3]);
    let displayUrl = realUrl;

    try {
      displayUrl = new URL(realUrl).hostname;
    } catch {
      // ignore parse error
    }

    results.push({
      title: title || realUrl,
      url: realUrl,
      snippet,
      displayUrl,
    });
  }

  return results;
}

async function fetchPageHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    redirect: "follow",
  });

  const html = await response.text();
  const baseUrl = new URL(response.url);
  const base = `${baseUrl.protocol}//${baseUrl.host}`;

  const rewrittenHtml = html
    .replace(/<head([^>]*)>/i, `<head$1><base href="${base}/" target="_self">`)
    .replace(/<meta[^>]*content-security-policy[^>]*>/gi, "");

  return {
    html: rewrittenHtml,
    finalUrl: response.url,
    status: response.status,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const mode = body?.mode ?? "fetch";

    if (mode === "search") {
      const query = String(body?.query ?? "").trim();
      if (!query) {
        return new Response(JSON.stringify({ error: "Missing search query" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = await searchWeb(query);
      return new Response(JSON.stringify({ query, results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = String(body?.url ?? "").trim();
    if (!url || !isAllowedUrl(url)) {
      return new Response(JSON.stringify({ error: "URL not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const page = await fetchPageHtml(url);
    return new Response(JSON.stringify(page), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
