import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

const PORTFOLIO_URL = 'https://readymag.website/u2801101920/5411866/'
const GOOGLE_URL = 'https://www.google.com/'

interface ReaderContent {
  title: string
  content: string
  siteName: string
}

interface Props {
  windowId: string
}

// Hardcoded search results — always shown
const HARDCODED_RESULTS = [
  {
    title: 'My Digital Crib (@mydigitalcrib) • Instagram photos and videos',
    url: 'https://www.instagram.com/mydigitalcrib/',
    snippet: '23K Followers, 456 Posts - See Instagram photos and videos from My Digital Crib (@mydigitalcrib) — Vintage computing aesthetics & digital curation',
    displayUrl: 'www.instagram.com/mydigitalcrib',
  },
  {
    title: 'hire me :) — Digital Portfolio & Creative Showcase',
    url: 'https://readymag.website/u2801101920/5411866/',
    snippet: "this ain't a regular site. it's touchable, scrollable, clickable, and loud. volume up. have fun. welcome to my side of the internet (aka my resume, just less boring)",
    displayUrl: 'readymag.website/u2801101920/5411866',
  },
]

export default function InternetExplorer({ windowId }: Props) {
  const [addressBar, setAddressBar] = useState(GOOGLE_URL)
  const [currentUrl, setCurrentUrl] = useState(GOOGLE_URL)
  const [history, setHistory] = useState<string[]>([GOOGLE_URL])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastSearchQuery, setLastSearchQuery] = useState('')

  // Reader state (for Readymag via Jina)
  const [readerContent, setReaderContent] = useState<ReaderContent | null>(null)
  const [readerLoading, setReaderLoading] = useState(false)
  const [readerError, setReaderError] = useState<string | null>(null)

  const isGoogleHome =
    currentUrl === GOOGLE_URL ||
    currentUrl === 'https://google.com' ||
    currentUrl === 'http://www.google.com'
  const isGoogleSearch = currentUrl.startsWith(`${GOOGLE_URL}search`)
  const isPortfolio = currentUrl.startsWith('https://readymag.website/u2801101920/5411866')
  const isInstagram = currentUrl.includes('instagram.com/mydigitalcrib')

  // Fetch page content via Jina reader (for Readymag and other non-special URLs)
  const fetchReader = useCallback(async (url: string) => {
    setReaderLoading(true)
    setReaderError(null)
    setReaderContent(null)
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
    if (isGoogleHome || isGoogleSearch || isInstagram) {
      setReaderContent(null)
      setReaderError(null)
      lastFetchedUrl.current = currentUrl
      if (isGoogleSearch) {
        const urlObj = new URL(currentUrl)
        setLastSearchQuery(urlObj.searchParams.get('q') || '')
      }
      return
    }
    // For Readymag and other URLs → use Jina reader
    if (currentUrl && currentUrl !== 'about:blank') {
      lastFetchedUrl.current = currentUrl
      fetchReader(currentUrl)
    }
  }, [currentUrl, isGoogleHome, isGoogleSearch, isInstagram, fetchReader])

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

  // Simple markdown renderer for Jina content
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '24px', fontWeight: 'bold', margin: '16px 0 8px' }}>{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '20px', fontWeight: 'bold', margin: '14px 0 6px' }}>{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '17px', fontWeight: 'bold', margin: '12px 0 4px' }}>{line.slice(4)}</h3>
      const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      if (imgMatch && !imgMatch[2].startsWith('blob:')) return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} style={{ maxWidth: '100%', margin: '8px 0', borderRadius: '4px' }} />
      if (imgMatch && imgMatch[2].startsWith('blob:')) return null
      const linkified = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0000CC;text-decoration:underline">$1</a>')
      const bolded = linkified.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      if (line.trim() === '') return <br key={i} />
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ marginLeft: '20px', fontSize: '14px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: bolded.slice(2) }} />
      return <p key={i} style={{ fontSize: '14px', lineHeight: '1.7', margin: '4px 0', color: '#333' }} dangerouslySetInnerHTML={{ __html: bolded }} />
    })
  }

  const renderContent = () => {
    // Google homepage
    if (isGoogleHome) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'Arial, sans-serif', background: '#fff' }}>
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

    // Search results — 2004-era Google style with hardcoded results
    if (isGoogleSearch) {
      return (
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', background: '#fff', height: '100%' }}>
          {/* Google header bar */}
          <div style={{ background: '#f1f1f1', borderBottom: '1px solid #e5e5e5', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '-1px' }}>
              <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
            </span>
            <form onSubmit={(e) => { e.preventDefault(); navigateTo(`${GOOGLE_URL}search?q=${encodeURIComponent(lastSearchQuery)}`) }} style={{ flex: 1, maxWidth: '500px' }}>
              <input value={lastSearchQuery} onChange={(e) => setLastSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 12px', fontSize: '14px', border: '1px solid #d9d9d9', outline: 'none', fontFamily: 'Arial, sans-serif' }} />
            </form>
          </div>

          {/* Stats bar */}
          <div style={{ padding: '6px 16px', color: '#808080', fontSize: '11px', borderBottom: '1px solid #e5e5e5' }}>
            Results 1 - 2 of about 2 for <b>{lastSearchQuery}</b>. (0.28 seconds)
          </div>

          {/* Results */}
          <div style={{ padding: '12px 16px' }}>
            {HARDCODED_RESULTS.map((result, i) => (
              <div key={i} style={{ marginBottom: '22px' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigateTo(result.url) }}
                  style={{ fontSize: '16px', color: '#0000CC', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Arial, sans-serif', lineHeight: '1.2' }}
                >
                  {result.title}
                </a>
                <div style={{ fontSize: '13px', color: '#008000', marginTop: '1px' }}>
                  {result.displayUrl}
                </div>
                <div style={{ fontSize: '13px', color: '#000', lineHeight: '1.4', marginTop: '2px' }}>
                  {result.snippet}
                </div>
              </div>
            ))}
          </div>

          {/* Google footer */}
          <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #e5e5e5', marginTop: '20px' }}>
            <span style={{ fontSize: '22px', letterSpacing: '-1px' }}>
              <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>o</span><span style={{ color: '#34A853' }}>o</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
            </span>
          </div>
        </div>
      )
    }

    // Instagram — exact 2012 iOS app replica
    if (isInstagram) {
      const igUrl = 'https://www.instagram.com/mydigitalcrib/'
      const openIg = () => {
        const a = document.createElement('a')
        a.href = igUrl
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      return (
        <div style={{
          cursor: 'default',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          background: '#ededed',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* === TOP NAV BAR === */}
          <div style={{
            background: 'linear-gradient(to bottom, #5d8fad 0%, #3a6d8e 50%, #336485 100%)',
            borderBottom: '1px solid #2a5570',
            padding: '7px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.25)',
          }}>
            {/* Explore button */}
            <div style={{
              background: 'linear-gradient(to bottom, #7ab0cc 0%, #5a95b5 100%)',
              border: '1px solid #4a85a5',
              borderRadius: '4px',
              padding: '4px 10px',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)',
            }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', textShadow: '0 -1px 0 rgba(0,0,0,0.3)' }}>Explore</span>
            </div>
            {/* Title */}
            <span style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>INSTAGRAM</span>
            {/* Share icon */}
            <div onClick={openIg} style={{
              background: 'linear-gradient(to bottom, #7ab0cc 0%, #5a95b5 100%)',
              border: '1px solid #4a85a5',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)',
            }}>
              <span style={{ color: '#fff', fontSize: '14px' }}>↗</span>
            </div>
          </div>

          {/* === SCROLLABLE CONTENT === */}
          <div style={{ flex: 1, overflow: 'auto', background: '#ededed' }}>

            {/* Profile card */}
            <div style={{
              background: '#fff',
              margin: '8px 8px 0',
              borderRadius: '4px',
              border: '1px solid #d0d0d0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}>
              {/* Top section: avatar + stats + follow */}
              <div style={{
                display: 'flex',
                padding: '12px 10px',
                gap: '10px',
                borderBottom: '1px solid #efefef',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '77px', height: '77px',
                  borderRadius: '5px',
                  border: '1px solid #d0d0d0',
                  background: '#1a1a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                }}>
                  <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>vibes</span>
                </div>

                {/* Stats + follow */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {/* Stats row with borders */}
                  <div style={{
                    display: 'flex',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRight: '1px solid #d0d0d0' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333', lineHeight: 1 }}>33</div>
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>photos</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRight: '1px solid #d0d0d0' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333', lineHeight: 1 }}>793</div>
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>followers</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '6px 0' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333', lineHeight: 1 }}>19</div>
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>following</div>
                    </div>
                  </div>

                  {/* Follow button — exact 2012 blue */}
                  <button style={{
                    width: '100%',
                    background: 'linear-gradient(to bottom, #6db3d5 0%, #4a99c4 100%)',
                    border: '1px solid #3886b0',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '7px 0',
                    cursor: 'pointer',
                    textShadow: '0 -1px 0 rgba(0,0,0,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.1)',
                  }}>Follow</button>
                </div>
              </div>

              {/* Bio section */}
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #efefef' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#262626', margin: '0 0 3px' }}>mydigitalcrib</p>
                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px', lineHeight: '1.45' }}>
                  hey bestie 💻<br />
                  we're vibes, your gen z marketing crew.<br />
                  taking your brand to the next level is our thing! 🫶
                </p>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('https://welcometomywebsites.com') }}
                  style={{ fontSize: '13px', color: '#3b6d8c', textDecoration: 'none' }}>
                  welcometomywebsites.com
                </a>
              </div>

              {/* Tabs: grid | list | photo map */}
              <div style={{
                display: 'flex',
                alignItems: 'stretch',
                borderBottom: '1px solid #efefef',
                background: '#fafafa',
              }}>
                {/* Grid tab — active */}
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 0', cursor: 'pointer',
                  borderBottom: '2px solid #3b6d8c',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="#3b6d8c">
                    <rect x="0" y="0" width="5" height="5" /><rect x="6.5" y="0" width="5" height="5" /><rect x="13" y="0" width="5" height="5" />
                    <rect x="0" y="6.5" width="5" height="5" /><rect x="6.5" y="6.5" width="5" height="5" /><rect x="13" y="6.5" width="5" height="5" />
                    <rect x="0" y="13" width="5" height="5" /><rect x="6.5" y="13" width="5" height="5" /><rect x="13" y="13" width="5" height="5" />
                  </svg>
                </div>
                {/* List tab */}
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 0', cursor: 'pointer',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="#ccc">
                    <rect x="0" y="1" width="18" height="2" /><rect x="0" y="6" width="18" height="2" />
                    <rect x="0" y="11" width="18" height="2" /><rect x="0" y="16" width="18" height="2" />
                  </svg>
                </div>
                {/* Photo Map */}
                <div style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '5px', padding: '10px 0', cursor: 'pointer',
                }}>
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="#ccc">
                    <path d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                  </svg>
                  <span style={{ fontSize: '13px', color: '#999', fontWeight: '500' }}>Photo Map</span>
                  <span style={{ fontSize: '16px', color: '#ccc', fontWeight: '300' }}>›</span>
                </div>
              </div>

              {/* Photo grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1px',
                background: '#e0e0e0',
              }}>
                {[
                  { bg: '#c2533a', emoji: '🏪' },
                  { bg: '#4a6a4a', emoji: '🎄' },
                  { bg: '#6a8a5a', emoji: '🎉' },
                  { bg: '#3a5a7a', emoji: '🌆' },
                  { bg: '#8a6a4a', emoji: '☕' },
                  { bg: '#5a7a9a', emoji: '🏠' },
                  { bg: '#7a5a3a', emoji: '📷' },
                  { bg: '#4a4a6a', emoji: '🎵' },
                  { bg: '#5a8a6a', emoji: '🌿' },
                  { bg: '#8a4a5a', emoji: '💻' },
                  { bg: '#3a6a5a', emoji: '🎨' },
                  { bg: '#6a5a8a', emoji: '✨' },
                ].map((item, i) => (
                  <div key={i} style={{
                    aspectRatio: '1',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: '28px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}>{item.emoji}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: '8px' }} />
          </div>

          {/* === BOTTOM TAB BAR — iOS 6 dark chrome === */}
          <div style={{
            background: 'linear-gradient(to bottom, #434343 0%, #1c1c1c 100%)',
            borderTop: '1px solid #606060',
            display: 'flex',
            padding: '5px 0 3px',
            flexShrink: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            {[
              { icon: '🏠', active: true },
              { icon: '⭐', active: false },
              { icon: '📷', active: false, special: true },
              { icon: '💬', active: false },
              { icon: '📇', active: false },
            ].map((tab, i) => (
              <div key={i} style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '4px 0',
                opacity: tab.active ? 1 : 0.4,
                ...(tab.special ? {
                  background: 'linear-gradient(to bottom, #5d8fad, #3a6d8e)',
                  borderRadius: '5px',
                  margin: '0 6px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.3)',
                  opacity: 1,
                } : {}),
              }}>
                {tab.icon}
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Reader mode (Jina) for Readymag and other URLs
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
              style={{ fontSize: '12px', color: '#0000CC', fontFamily: 'Arial, sans-serif', textDecoration: 'underline' }}>
              Open original page ↗
            </a>
          </div>
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

      {/* Content */}
      <div className="xp-ie-content" style={{ flex: 1, backgroundColor: '#fff', margin: 0, padding: 0, overflow: 'auto' }}>
        {renderContent()}
      </div>

      {/* Status Bar */}
      <div className="xp-ie-statusbar" style={{ height: '22px', backgroundColor: '#ECE9D8', borderTop: '1px solid #ACA899', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '11px', color: '#333' }}>
        <span style={{ flex: 1 }}>{readerLoading ? 'Loading...' : 'Done'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #ACA899', paddingLeft: '8px' }}>🌐 Internet</span>
      </div>
    </div>
  )
}

// Portfolio site component
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
    <div style={{ height: '100%', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)', color: '#fff', fontFamily: "'Arial', sans-serif", overflow: 'auto', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://i-p.rmcdn.net/67e9f32d05137a26916f90a5/5411866/image-379fff01-5b6b-4681-8b43-70fd84c97339.png?w=300&e=webp&nll=true)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)' }} />
      {showWarning && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#FFD700', color: '#000', borderRadius: '16px', padding: '30px 40px', maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowWarning(false)} style={{ position: 'absolute', top: '10px', right: '14px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#000' }}>✕</button>
            <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 12px' }}>WARNING</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' }}>this ain't a regular site.<br />it's touchable, scrollable, clickable, and loud.<br />volume up. have fun.</p>
            <p style={{ fontSize: '13px', margin: 0, fontStyle: 'italic' }}>welcome to my side of the internet<br />(aka my resume, just less boring)</p>
          </div>
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 5, padding: '40px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(PORTFOLIO_BASE) }} style={{ color: '#fff', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>My Digital Drafts</a>
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
            {['image-952ad33b-466e-47fd-90fa-7d253f913fde','image-8c416ae5-c92a-43ff-af12-ce43ddd0ae32','image-b9f14574-36fe-4a4f-b21f-e5c9a8df10b3','image-35fa2936-1eba-48a4-9326-f7eeda1bd0fa','image-0865149c-34db-408d-ae22-f372a4588229','image-10f721cf-d2af-4446-81f3-740bc1c624c1'].map((id) => (
              <div key={id} style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', background: '#222' }}>
                <img src={`https://i-p.rmcdn.net/67e9f32d05137a26916f90a5/5411866/${id}.png?w=300&e=webp&nll=true`} alt="Project" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
        )}
        {page === 'socials' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
            <a href="https://www.instagram.com/mydigitaldrafts/" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 32px', background: '#FFD700', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>📸 Instagram — @mydigitaldrafts</a>
            <a href="https://ifyourereadingthishiremenow.my.canva.site/" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 32px', background: '#333', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>🌐 MySpace</a>
          </div>
        )}
      </div>
    </div>
  )
}