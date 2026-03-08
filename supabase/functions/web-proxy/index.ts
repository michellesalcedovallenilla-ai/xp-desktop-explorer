const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function getFirecrawlKey(): string {
  const key = Deno.env.get('FIRECRAWL_API_KEY')
  if (!key) throw new Error('Firecrawl not configured')
  return key
}

async function searchWeb(query: string) {
  const apiKey = getFirecrawlKey()

  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit: 10,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Firecrawl search error:', data)
    throw new Error(data.error || `Search failed: ${response.status}`)
  }

  const results: { title: string; url: string; snippet: string; displayUrl: string }[] = []

  const items = data?.data || data?.results || []
  for (const item of items) {
    if (item.url && item.title) {
      let displayUrl = item.url
      try { displayUrl = new URL(item.url).hostname } catch {}
      results.push({
        title: item.title,
        url: item.url,
        snippet: item.description || item.markdown?.substring(0, 200) || '',
        displayUrl,
      })
    }
  }

  return results
}

async function readPage(url: string): Promise<{ title: string; content: string; siteName: string }> {
  // Use Jina.ai reader API - free, no key needed
  const jinaUrl = `https://r.jina.ai/${url}`
  console.log('Reading with Jina:', jinaUrl)

  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    console.error('Jina reader error:', response.status)
    throw new Error(`Failed to read page: ${response.status}`)
  }

  const data = await response.json()
  
  return {
    title: data?.data?.title || '',
    content: data?.data?.content || data?.data?.text || '',
    siteName: (() => { try { return new URL(url).hostname } catch { return url } })(),
  }
}

async function fetchPage(url: string): Promise<string> {
  const apiKey = getFirecrawlKey()

  console.log('Scraping with Firecrawl:', url)

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
    console.error('Firecrawl scrape error:', data)
    const errMsg = data?.error || `Scrape failed: ${response.status}`
    if (errMsg.includes('do not support this site') || errMsg.includes('blocked')) {
      throw new Error('BLOCKED:' + errMsg)
    }
    throw new Error(errMsg)
  }

  const html = data?.data?.html || data?.html || ''
  if (!html || html.trim().length < 50) {
    throw new Error('Page returned empty content')
  }

  console.log('Scrape success, HTML length:', html.length)
  return html
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

    // Reader mode - returns clean markdown/text content via Jina.ai
    if (body.mode === 'read') {
      const url = body.url?.trim()
      if (!url) {
        return new Response(JSON.stringify({ error: 'URL required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      try {
        const result = await readPage(url)
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (err) {
        const msg = (err as Error).message || 'Failed to read'
        return new Response(JSON.stringify({ error: msg }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Proxy mode (HTML)
    const url = body.url?.trim()
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let html: string
    try {
      html = await fetchPage(url)
    } catch (pageErr) {
      const msg = (pageErr as Error).message || 'Failed to load'
      return new Response(JSON.stringify({ error: msg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cleanHtml = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')

    return new Response(JSON.stringify({ html: cleanHtml }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = (err as Error).message || 'Proxy failed'
    console.error('Proxy error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})