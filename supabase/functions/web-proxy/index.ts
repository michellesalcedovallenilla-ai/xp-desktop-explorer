const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options)
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const delayMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.pow(2, attempt) * 1000 + Math.random() * 1000
      console.log(`Rate limited, waiting ${delayMs}ms before retry ${attempt + 1}`)
      await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 30000)))
      continue
    }
    return response
  }
  throw new Error('Rate limited - max retries exceeded')
}

async function searchWeb(query: string) {
  const encoded = encodeURIComponent(query)
  const url = `https://www.bing.com/search?q=${encoded}&format=rss&count=10`
  const resp = await fetchWithRetry(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  const text = await resp.text()

  const results: { title: string; url: string; snippet: string; displayUrl: string }[] = []
  const items = text.split('<item>')
  for (let i = 1; i < items.length; i++) {
    const item = items[i]
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1] || item.match(/<title>(.*?)<\/title>/s)?.[1] || ''
    const link = item.match(/<link>(.*?)<\/link>/s)?.[1] || ''
    const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1] || item.match(/<description>(.*?)<\/description>/s)?.[1] || ''
    if (title && link) {
      let displayUrl = link
      try { displayUrl = new URL(link).hostname } catch {}
      results.push({ title, url: link, snippet: desc.replace(/<[^>]*>/g, ''), displayUrl })
    }
  }
  return results
}

async function fetchWithFirecrawl(url: string): Promise<string> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY')
  if (!apiKey) {
    throw new Error('Firecrawl not configured')
  }

  console.log('Fetching with Firecrawl:', url)

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['html'],
      waitFor: 5000,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Firecrawl error:', data)
    throw new Error(data.error || `Firecrawl request failed: ${response.status}`)
  }

  const html = data?.data?.html || data?.html || ''
  if (!html) {
    throw new Error('No HTML returned from Firecrawl')
  }

  console.log('Firecrawl success, HTML length:', html.length)
  return html
}

async function fetchSimple(url: string): Promise<string> {
  const resp = await fetchWithRetry(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  })

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return await resp.text()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Search mode
    if (body.mode === 'search') {
      const query = body.query?.trim()
      if (!query) {
        return new Response(JSON.stringify({ query: '', results: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const results = await searchWeb(query)
      return new Response(JSON.stringify({ query, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Proxy mode - fetch URL
    const url = body.url?.trim()
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let html: string

    // Try Firecrawl first (handles JS-heavy sites), fallback to simple fetch
    try {
      html = await fetchWithFirecrawl(url)
    } catch (fcErr) {
      console.log('Firecrawl failed, falling back to simple fetch:', (fcErr as Error).message)
      html = await fetchSimple(url)

      // Add base tag for relative URLs
      const origin = new URL(url).origin
      if (!html.includes('<base')) {
        html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/" target="_self">`)
      }
    }

    // Strip CSP meta tags that block iframe rendering
    html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Proxy error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message || 'Proxy failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
