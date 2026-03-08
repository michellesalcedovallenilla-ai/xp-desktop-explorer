import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

const PORTFOLIO_URL = 'https://readymag.website/u2801101920/5411866/'
const GOOGLE_URL = 'https://www.google.com/'

interface SearchResult {
  title: string
  url: string
  snippet: string
  displayUrl: string
}

interface ReaderContent {
  title: string
  content: string
  siteName: string
}

interface Props {
  windowId: string
}

export default function InternetExplorer({ windowId }: Props) {
  const [addressBar, setAddressBar] = useState(GOOGLE_URL)
  const [currentUrl, setCurrentUrl] = useState(GOOGLE_URL)
  const [history, setHistory] = useState<string[]>([GOOGLE_URL])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lastSearchQuery, setLastSearchQuery] = useState('')

  // Reader state
  const [readerContent, setReaderContent] = useState<ReaderContent | null>(null)
  const [readerLoading, setReaderLoading] = useState(false)
  const [readerError, setReaderError] = useState<string | null>(null)

  const isGoogleHome =
    currentUrl === GOOGLE_URL ||
    currentUrl === 'https://google.com' ||
    currentUrl === 'http://www.google.com'
  const isGoogleSearch = currentUrl.startsWith(`${GOOGLE_URL}search`)
  const isPortfolio = currentUrl.startsWith('https://readymag.website/u2801101920/5411866')

  // Fetch search results
  const fetchSearch = useCallback(async (query: string) => {
    setSearchLoading(true)
    setSearchError(null)
    setSearchResults([])
    setReaderContent(null)
    try {
      const { data, error } = await supabase.functions.invoke('web-proxy', {
        body: { mode: 'search', query },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setSearchResults(data?.results || [])
      setLastSearchQuery(query)
    } catch (err: any) {
      setSearchError(err.message || 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Fetch page content via Jina reader
  const fetchReader = useCallback(async (url: string) => {
    setReaderLoading(true)
    setReaderError(null)
    setReaderContent(null)
    setSearchResults([])
    try {
      const { data, error } = await supabase.functions.invoke('web-proxy', {
        body: { mode: 'read', url },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setReaderContent({
        title: data?.title || '',
        content: data?.content || '',
        siteName: data?.siteName || '',
      })
    } catch (err: any) {
      setReaderError(err.message || 'Failed to load page')
    } finally {
      setReaderLoading(false)
    }
  }, [])

  // React to URL changes
  const lastFetchedUrl = useRef('')
  useEffect(() => {
    if (currentUrl === lastFetchedUrl.current) return
    if (isGoogleHome || isPortfolio) {
      setSearchResults([])
      setReaderContent(null)
      setSearchError(null)
      setReaderError(null)
      lastFetchedUrl.current = currentUrl
      return
    }
    if (isGoogleSearch) {
      const urlObj = new URL(currentUrl)
      const q = urlObj.searchParams.get('q') || ''
      if (q) {
        lastFetchedUrl.current = currentUrl
        fetchSearch(q)
      }
      return
    }
    // Any other URL → reader mode
    if (currentUrl && currentUrl !== 'about:blank') {
      lastFetchedUrl.current = currentUrl
      fetchReader(currentUrl)
    }
  }, [currentUrl, isGoogleHome, isGoogleSearch, isPortfolio, fetchSearch, fetchReader])

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
      lastFetchedUrl.current = ''
      setCurrentUrl(history[index])
      setAddressBar(history[index])
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const index = historyIndex + 1
      setHistoryIndex(index)
      lastFetchedUrl.current = ''
      setCurrentUrl(history[index])
      setAddressBar(history[index])
    }
  }

  const handleGoHome = () => navigateTo(GOOGLE_URL)

  const handleRefresh = () => {
    lastFetchedUrl.current = ''
    const temp = currentUrl
    setCurrentUrl('about:blank')
    setTimeout(() => setCurrentUrl(temp), 50)
  }

  // Simple markdown-like renderer for Jina content
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '24px', fontWeight: 'bold', margin: '16px 0 8px' }}>{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '20px', fontWeight: 'bold', margin: '14px 0 6px' }}>{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '17px', fontWeight: 'bold', margin: '12px 0 4px' }}>{line.slice(4)}</h3>
      // Images
      const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      if (imgMatch) return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} style={{ maxWidth: '100%', margin: '8px 0', borderRadius: '4px' }} />
      // Links in text
      const linkified = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#1a0dab;text-decoration:underline">$1</a>')
      // Bold
      const bolded = linkified.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Empty line
      if (line.trim() === '') return <br key={i} />
      // List items
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ marginLeft: '20px', fontSize: '14px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: bolded.slice(2) }} />
      // Regular paragraph
      return <p key={i} style={{ fontSize: '14px', lineHeight: '1.7', margin: '4px 0', color: '#333' }} dangerouslySetInnerHTML={{ __html: bolded }} />
    })
  }

  const renderContent = () => {
    // Google homepage
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

    // Search results page
    if (isGoogleSearch) {
      if (searchLoading) {
        return (
          <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>🔍</div>
            <p style={{ color: '#666', fontSize: '14px' }}>Searching...</p>
          </div>
        )
      }
      if (searchError) {
        return (
          <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ color: '#666' }}>{searchError}</p>
            <button onClick={handleRefresh} style={{ marginTop: '12px', padding: '8px 24px', backgroundColor: '#4285F4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
          </div>
        )
      }
      return (
        <div style={{ padding: '20px 30px', fontFamily: 'Arial, sans-serif', maxWidth: '700px' }}>
          {/* Search bar at top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #ebebeb' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
              <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
            </span>
            <form onSubmit={(e) => { e.preventDefault(); navigateTo(`${GOOGLE_URL}search?q=${encodeURIComponent(lastSearchQuery)}`) }} style={{ flex: 1 }}>
              <input value={lastSearchQuery} onChange={(e) => setLastSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 16px', fontSize: '14px', borderRadius: '24px', border: '1px solid #dfe1e5', outline: 'none' }} />
            </form>
          </div>

          {/* Results count */}
          <p style={{ fontSize: '12px', color: '#70757a', marginBottom: '16px' }}>
            About {searchResults.length} results
          </p>

          {/* Results */}
          {searchResults.length === 0 && !searchLoading && (
            <p style={{ color: '#666', fontSize: '14px' }}>No results found.</p>
          )}
          {searchResults.map((result, i) => (
            <div key={i} style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#202124', marginBottom: '2px' }}>
                {result.displayUrl}
              </div>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigateTo(result.url) }}
                style={{ fontSize: '18px', color: '#1a0dab', textDecoration: 'none', cursor: 'pointer', lineHeight: '1.3' }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {result.title}
              </a>
              <p style={{ fontSize: '13px', color: '#4d5156', lineHeight: '1.5', margin: '4px 0 0' }}>
                {result.snippet}
              </p>
            </div>
          ))}
        </div>
      )
    }

    // Portfolio site (simulated)
    if (isPortfolio) {
      const path = currentUrl.replace('https://readymag.website/u2801101920/5411866/', '').replace(/\/$/, '') || 'home'
      return <PortfolioSite page={path} onNavigate={navigateTo} />
    }

    // Reader mode for any other URL
    if (readerLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🌐</div>
            <p style={{ color: '#666', fontSize: '14px' }}>Loading {currentUrl}...</p>
          </div>
        </div>
      )
    }

    if (readerError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'Arial, sans-serif', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>This page can't be displayed</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', maxWidth: '400px' }}>{readerError}</p>
          <button onClick={handleRefresh} style={{ padding: '8px 24px', backgroundColor: '#3168D5', color: '#fff', border: '1px solid #2050A0', borderRadius: '3px', fontSize: '13px', cursor: 'pointer' }}>Try Again</button>
        </div>
      )
    }

    if (readerContent) {
      return (
        <div style={{ padding: '24px 32px', fontFamily: 'Georgia, serif', maxWidth: '800px', margin: '0 auto', overflow: 'auto', height: '100%' }}>
          {/* Reader header */}
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>
              📖 Reader View — {readerContent.siteName}
            </div>
            {readerContent.title && (
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: 0, lineHeight: '1.3' }}>
                {readerContent.title}
              </h1>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); window.open(currentUrl, '_blank') }}
              style={{ fontSize: '12px', color: '#4285F4', fontFamily: 'Arial, sans-serif', textDecoration: 'none' }}>
              Open original page ↗
            </a>
          </div>
          {/* Content */}
          <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333' }}>
            {renderMarkdown(readerContent.content)}
          </div>
        </div>
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
        <span style={{ flex: 1 }}>{(searchLoading || readerLoading) ? `Loading...` : 'Done'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #ACA899', paddingLeft: '8px' }}>🌐 Internet</span>
      </div>
    </div>
  )
}

// Portfolio site component (kept as-is)
function PortfolioSite({ page, onNavigate }: { page: string; onNavigate: (url: string) => void }) {
  const [showWarning, setShowWarning] = useState(page === 'home')
  const PORTFOLIO_BASE = 'https://readymag.website/u2801101920/5411866/'

  const navLinks = [
    { label: 'portfolio', url: `${PORTFOLIO_BASE}portfolio/` },
    { label: 'about me', url: `${PORTFOLIO_BASE}aboutme/` },
    { label: 'socials', url: `${PORTFOLIO_BASE}socials/` },
    { label: 'Must-Know Info', url: `${PORTFOLIO_BASE}faq/` },
    { label: 'my keywords', url: `${PORTFOLIO_BASE}keywords/` },
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
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://i-p.rmcdn.net/67e9f32d05137a26916f90a5/5411866/image-379fff01-5b6b-4681-8b43-70fd84c97339.png?w=300&e=webp&nll=true)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)'
      }} />

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

      <div style={{ position: 'relative', zIndex: 5, padding: '40px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(PORTFOLIO_BASE) }}
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