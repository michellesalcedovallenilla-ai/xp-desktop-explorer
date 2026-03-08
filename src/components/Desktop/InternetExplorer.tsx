import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

const PORTFOLIO_URL = 'https://readymag.website/u2801101920/5411866/'
const PORTFOLIO_PAGES: Record<string, string> = {
  'https://readymag.website/u2801101920/5411866/': 'home',
  'https://readymag.website/u2801101920/5411866/welcome/': 'welcome',
  'https://readymag.website/u2801101920/5411866/portfolio/': 'portfolio',
  'https://readymag.website/u2801101920/5411866/aboutme/': 'aboutme',
  'https://readymag.website/u2801101920/5411866/socials/': 'socials',
  'https://readymag.website/u2801101920/5411866/faq/': 'faq',
  'https://readymag.website/u2801101920/5411866/keywords/': 'keywords',
}
const INSTAGRAM_URL = 'https://www.instagram.com/mydigitaldrafts/'
const GOOGLE_URL = 'https://www.google.com/'

function PortfolioSite({ page, onNavigate }: { page: string; onNavigate: (url: string) => void }) {
  const [showWarning, setShowWarning] = useState(page === 'home')

  const navLinks = [
    { label: 'portfolio', url: 'https://readymag.website/u2801101920/5411866/portfolio/' },
    { label: 'about me', url: 'https://readymag.website/u2801101920/5411866/aboutme/' },
    { label: 'socials', url: 'https://readymag.website/u2801101920/5411866/socials/' },
    { label: 'Must-Know Info', url: 'https://readymag.website/u2801101920/5411866/faq/' },
    { label: 'my keywords', url: 'https://readymag.website/u2801101920/5411866/keywords/' },
  ]

  const pageContent: Record<string, { title: string; body: string }> = {
    portfolio: { title: 'Portfolio', body: 'A collection of projects, designs, and interactive experiences crafted with passion and creativity.' },
    aboutme: { title: 'About Me', body: 'Creative designer and developer. I build things that live on the internet — from interactive sites to digital experiences.' },
    socials: { title: 'Socials', body: 'Find me on Instagram @mydigitaldrafts and across the web.' },
    faq: { title: 'Must-Know Info', body: 'Everything you need to know about working with me, my process, and what I bring to the table.' },
    keywords: { title: 'My Keywords', body: 'Design • Development • Creativity • Interactive • Digital • Experience • Innovation' },
    welcome: { title: 'Welcome', body: 'Welcome to my side of the internet. Explore around!' },
    home: { title: '', body: '' },
  }

  const content = pageContent[page]

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      color: '#fff',
      fontFamily: "'Arial', sans-serif",
      overflow: 'auto',
      position: 'relative'
    }}>
      {/* Blurred background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://i-p.rmcdn.net/67e9f32d05137a26916f90a5/5411866/image-379fff01-5b6b-4681-8b43-70fd84c97339.png?w=300&e=webp&nll=true)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)'
      }} />

      {/* Warning popup */}
      {showWarning && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 10, background: 'rgba(0,0,0,0.5)'
        }}>
          <div style={{
            background: '#FFD700', color: '#000', borderRadius: '16px',
            padding: '30px 40px', maxWidth: '400px', textAlign: 'center', position: 'relative'
          }}>
            <button onClick={() => setShowWarning(false)} style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#000'
            }}>✕</button>
            <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 12px' }}>WARNING</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' }}>
              this ain't a regular site.<br />
              it's touchable, scrollable, clickable, and loud.<br />
              volume up. have fun.
            </p>
            <p style={{ fontSize: '13px', margin: 0, fontStyle: 'italic' }}>
              welcome to my side of the internet<br />
              (aka my resume, just less boring)
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ position: 'relative', zIndex: 5, padding: '40px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(PORTFOLIO_URL) }}
            style={{ color: '#fff', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
            My Digital Drafts
          </a>
          <div style={{ display: 'flex', gap: '20px' }}>
            {navLinks.map((link) => (
              <a key={link.label} href="#" onClick={(e) => { e.preventDefault(); onNavigate(link.url) }}
                style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFD700')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#ccc')}
              >{link.label}</a>
            ))}
          </div>
        </div>

        {content && content.title && (
          <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' }}>{content.title}</h1>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#ccc' }}>{content.body}</p>
          </div>
        )}

        {(page === 'home' || page === 'portfolio') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '40px' }}>
            {[
              'image-952ad33b-466e-47fd-90fa-7d253f913fde',
              'image-8c416ae5-c92a-43ff-af12-ce43ddd0ae32',
              'image-b9f14574-36fe-4a4f-b21f-e5c9a8df10b3',
              'image-35fa2936-1eba-48a4-9326-f7eeda1bd0fa',
              'image-0865149c-34db-408d-ae22-f372a4588229',
              'image-10f721cf-d2af-4446-81f3-740bc1c624c1',
            ].map((id) => (
              <div key={id} style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', background: '#222' }}>
                <img src={`https://i-p.rmcdn.net/67e9f32d05137a26916f90a5/5411866/${id}.png?w=300&e=webp&nll=true`}
                  alt="Project" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
        )}

        {page === 'socials' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
            <a href="https://www.instagram.com/mydigitaldrafts/" target="_blank" rel="noopener noreferrer"
              style={{ padding: '12px 32px', background: '#FFD700', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
              📸 Instagram — @mydigitaldrafts
            </a>
            <a href="https://ifyourereadingthishiremenow.my.canva.site/" target="_blank" rel="noopener noreferrer"
              style={{ padding: '12px 32px', background: '#333', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
              🌐 MySpace
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  windowId: string
}

interface LiveSearchResult {
  title: string
  url: string
  snippet: string
  displayUrl: string
}

export default function InternetExplorer({ windowId }: Props) {
  const [addressBar, setAddressBar] = useState(GOOGLE_URL)
  const [currentUrl, setCurrentUrl] = useState(GOOGLE_URL)
  const [history, setHistory] = useState<string[]>([GOOGLE_URL])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [liveSearchResults, setLiveSearchResults] = useState<LiveSearchResult[]>([])
  const [liveSearchLoading, setLiveSearchLoading] = useState(false)
  const [liveSearchError, setLiveSearchError] = useState<string | null>(null)
  const [proxyHtml, setProxyHtml] = useState<string | null>(null)
  const [proxyLoading, setProxyLoading] = useState(false)
  const [proxyError, setProxyError] = useState<string | null>(null)

  const isGoogleHome =
    currentUrl === GOOGLE_URL ||
    currentUrl === 'https://google.com' ||
    currentUrl === 'http://www.google.com'
  const isGoogleSearch = currentUrl.startsWith(`${GOOGLE_URL}search`)
  const isSimulated = isGoogleHome || isGoogleSearch

  const fetchProxy = useCallback(async (url: string) => {
    setProxyLoading(true)
    setProxyError(null)
    setProxyHtml(null)
    try {
      const { data, error } = await supabase.functions.invoke('web-proxy', {
        body: { url },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      if (!data?.html || data.html.trim().length < 100) {
        // Empty or near-empty response — site requires auth or blocked
        setProxyError('This website requires authentication or blocked the request.')
      } else {
        setProxyHtml(data.html)
      }
    } catch (err: any) {
      setProxyError(err.message || 'Failed to load page')
    } finally {
      setProxyLoading(false)
    }
  }, [])

  const fetchLiveSearch = useCallback(async (query: string) => {
    setLiveSearchLoading(true)
    setLiveSearchError(null)
    try {
      const { data, error } = await supabase.functions.invoke('web-proxy', {
        body: { mode: 'search', query },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setLiveSearchResults(Array.isArray(data?.results) ? data.results : [])
    } catch (err: any) {
      setLiveSearchResults([])
      setLiveSearchError(err.message || 'Search failed')
    } finally {
      setLiveSearchLoading(false)
    }
  }, [])

  const lastFetchedUrl = useRef('')
  useEffect(() => {
    if (!isSimulated && currentUrl && currentUrl !== 'about:blank' && currentUrl !== lastFetchedUrl.current) {
      lastFetchedUrl.current = currentUrl
      fetchProxy(currentUrl)
    } else if (isSimulated) {
      setProxyHtml(null)
      setProxyError(null)
      lastFetchedUrl.current = ''
    }
  }, [currentUrl, isSimulated, fetchProxy])

  useEffect(() => {
    if (!isGoogleSearch) {
      setLiveSearchResults([])
      setLiveSearchError(null)
      return
    }

    const query = new URL(currentUrl).searchParams.get('q')?.trim() ?? ''
    if (!query) {
      setLiveSearchResults([])
      setLiveSearchError(null)
      return
    }

    setSearchQuery(query)
    fetchLiveSearch(query)
  }, [currentUrl, isGoogleSearch, fetchLiveSearch])

  const navigateTo = (url: string) => {
    let finalUrl = url
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('www')) {
      finalUrl = `${GOOGLE_URL}search?q=${encodeURIComponent(url)}`
    } else if (finalUrl.startsWith('www')) {
      finalUrl = `https://${finalUrl}`
    }

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(finalUrl)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setCurrentUrl(finalUrl)
    setAddressBar(finalUrl)
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateTo(addressBar)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateTo(`${GOOGLE_URL}search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      const index = historyIndex - 1
      setHistoryIndex(index)
      setCurrentUrl(history[index])
      setAddressBar(history[index])
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const index = historyIndex + 1
      setHistoryIndex(index)
      setCurrentUrl(history[index])
      setAddressBar(history[index])
    }
  }

  const handleGoHome = () => navigateTo(GOOGLE_URL)

  const handleRefresh = () => {
    if (isSimulated) {
      const temp = currentUrl
      setCurrentUrl('about:blank')
      setTimeout(() => setCurrentUrl(temp), 50)
    } else {
      fetchProxy(currentUrl)
    }
  }

  const renderContent = () => {
    if (isGoogleHome) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '-3px' }}>
            <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
          </div>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 15px', fontSize: '16px', borderRadius: '24px', border: '1px solid #dfe1e5', outline: 'none', marginBottom: '20px' }}
              placeholder="Search Google or type a URL" autoFocus />
            <div>
              <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', backgroundColor: '#f8f9fa', color: '#3c4043', cursor: 'pointer', fontSize: '14px', margin: '0 5px' }}>Google Search</button>
              <button type="button" onClick={() => navigateTo(PORTFOLIO_URL)} style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', backgroundColor: '#f8f9fa', color: '#3c4043', cursor: 'pointer', fontSize: '14px', margin: '0 5px' }}>I'm Feeling Lucky</button>
            </div>
          </form>
        </div>
      )
    }

    if (isGoogleSearch) {
      const urlObj = new URL(currentUrl)
      const query = urlObj.searchParams.get('q') || ''

      return (
        <div style={{ padding: '20px 30px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #ebebeb', paddingBottom: '15px', marginBottom: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', marginRight: '30px' }}>
              <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
            </span>
            <form onSubmit={(e) => { e.preventDefault(); navigateTo(`${GOOGLE_URL}search?q=${encodeURIComponent(searchQuery || query)}`) }} style={{ flex: 1, maxWidth: '600px', display: 'flex' }}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '8px 15px', fontSize: '16px', borderRadius: '24px 0 0 24px', border: '1px solid #dfe1e5', outline: 'none' }} />
              <button type="submit" style={{ padding: '0 20px', borderRadius: '0 24px 24px 0', border: '1px solid #dfe1e5', borderLeft: 'none', background: '#fff', cursor: 'pointer' }}>🔍</button>
            </form>
          </div>

          {liveSearchLoading ? (
            <p style={{ color: '#70757a', fontSize: '14px' }}>Searching the web...</p>
          ) : liveSearchError ? (
            <p style={{ color: '#b00020', fontSize: '14px' }}>{liveSearchError}</p>
          ) : (
            <>
              <p style={{ color: '#70757a', fontSize: '14px', marginBottom: '20px' }}>
                About {liveSearchResults.length} results
              </p>

              {liveSearchResults.length === 0 ? (
                <p style={{ color: '#4d5156', fontSize: '14px' }}>No results found.</p>
              ) : (
                liveSearchResults.map((result) => (
                  <div key={`${result.url}-${result.title}`} style={{ marginBottom: '28px', maxWidth: '700px' }}>
                    <div style={{ fontSize: '14px', color: '#202124', marginBottom: '2px' }}>{result.displayUrl}</div>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        navigateTo(result.url)
                      }}
                      style={{ fontSize: '20px', color: '#1a0dab', textDecoration: 'none', display: 'block', marginBottom: '4px' }}
                    >
                      {result.title}
                    </a>
                    <div style={{ color: '#4d5156', fontSize: '14px', lineHeight: '1.4' }}>
                      {result.snippet || result.url}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )
    }

    // Portfolio and other external sites are loaded via proxy below

    // Proxy-loaded content
    if (proxyLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>🌐</div>
            <p style={{ color: '#666', fontSize: '14px' }}>Loading {currentUrl}...</p>
          </div>
        </div>
      )
    }

    if (proxyError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'Arial, sans-serif', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>This page can't be displayed</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', maxWidth: '400px' }}>{proxyError}</p>
          <button onClick={handleRefresh} style={{ padding: '8px 24px', backgroundColor: '#3168D5', color: '#fff', border: '1px solid #2050A0', borderRadius: '3px', fontSize: '13px', cursor: 'pointer' }}>Try Again</button>
        </div>
      )
    }

    if (proxyHtml) {
      return (
        <iframe
          srcDoc={proxyHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title="Proxied content"
        />
      )
    }

    return null
  }

  return (
    <div className="xp-ie" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="xp-ie-toolbar" style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', backgroundColor: '#ECE9D8', borderBottom: '1px solid #ACA899' }}>
        <button onClick={handleBack} disabled={historyIndex === 0} title="Back"
          style={{ opacity: historyIndex === 0 ? 0.5 : 1, fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', marginRight: '4px', color: historyIndex === 0 ? '#999' : '#000' }}>◄</button>
        <button onClick={handleForward} disabled={historyIndex === history.length - 1} title="Forward"
          style={{ opacity: historyIndex === history.length - 1 ? 0.5 : 1, fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: historyIndex === history.length - 1 ? '#999' : '#000' }}>►</button>
        <button onClick={handleRefresh} title="Refresh" style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>🔄</button>
        <button onClick={handleGoHome} title="Home" style={{ fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }}>🏠</button>
        <form onSubmit={handleAddressSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #7F9DB9', padding: '2px' }}>
          <span style={{ padding: '0 8px', fontSize: '12px', color: '#555', borderRight: '1px solid #CCC' }}>Address</span>
          <input value={addressBar} onChange={(e) => setAddressBar(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '2px 8px', fontSize: '12px', fontFamily: 'Tahoma' }} />
          <button type="submit" style={{ padding: '2px 8px', fontSize: '10px', background: '#ECE9D8', border: '1px solid #ACA899', cursor: 'pointer' }}>Go</button>
        </form>
      </div>

      {/* Content Area */}
      <div className="xp-ie-content" style={{ flex: 1, backgroundColor: '#fff', margin: 0, padding: 0, overflow: 'auto' }}>
        {renderContent()}
      </div>

      {/* Status Bar */}
      <div className="xp-ie-statusbar" style={{ height: '22px', backgroundColor: '#ECE9D8', borderTop: '1px solid #ACA899', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '11px', color: '#333' }}>
        <span style={{ flex: 1 }}>{proxyLoading ? `Loading ${currentUrl}...` : 'Done'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #ACA899', paddingLeft: '8px' }}>🌐 Internet</span>
      </div>
    </div>
  )
}