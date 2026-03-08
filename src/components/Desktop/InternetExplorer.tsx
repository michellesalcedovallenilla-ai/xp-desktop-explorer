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
  {
    title: 'MySpace.com',
    url: 'https://ifyourereadingthishiremenow.my.canva.site',
    snippet: 'Creative portfolio & digital playground. Design, development, and everything in between. Welcome to my MySpace — vibes only ✨',
    displayUrl: 'ifyourereadingthishiremenow.my.canva.site',
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
  const isMyspace = currentUrl.includes('ifyourereadingthishiremenow.my.canva.site')

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
    if (isGoogleHome || isGoogleSearch || isInstagram || isPortfolio) {
      setReaderContent(null)
      setReaderError(null)
      setReaderLoading(false)
      lastFetchedUrl.current = currentUrl
      if (isGoogleSearch) {
        const urlObj = new URL(currentUrl)
        setLastSearchQuery(urlObj.searchParams.get('q') || '')
      }
      return
    }
    // For non-special URLs → use reader
    if (currentUrl && currentUrl !== 'about:blank') {
      lastFetchedUrl.current = currentUrl
      fetchReader(currentUrl)
    }
  }, [currentUrl, isGoogleHome, isGoogleSearch, isInstagram, isPortfolio, fetchReader])

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

    // Nostalgic portfolio mock
    if (isPortfolio) {
      const page = currentUrl.includes('/aboutme')
        ? 'aboutme'
        : currentUrl.includes('/socials')
          ? 'socials'
          : currentUrl.includes('/faq')
            ? 'faq'
            : currentUrl.includes('/keywords')
              ? 'keywords'
              : currentUrl.includes('/portfolio')
                ? 'portfolio'
                : 'home'

      return <PortfolioSite page={page} onNavigate={navigateTo} />
    }

    // Instagram — exact 2012 iOS app replica
    if (isInstagram) {
      const igUrl = 'https://www.instagram.com/mydigitalcrib/'
      // Wrap entire view in a native <a> so clicks pass through sandbox
      const IgLink = ({ children, style, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) => (
        <a href={igUrl} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', ...style }} {...props}>
          {children}
        </a>
      )
      return (
        <div style={{
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
            <IgLink style={{
              background: 'linear-gradient(to bottom, #7ab0cc 0%, #5a95b5 100%)',
              border: '1px solid #4a85a5',
              borderRadius: '4px',
              padding: '4px 10px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)',
              display: 'inline-block',
            }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', textShadow: '0 -1px 0 rgba(0,0,0,0.3)' }}>Explore</span>
            </IgLink>
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
            <IgLink style={{
              background: 'linear-gradient(to bottom, #7ab0cc 0%, #5a95b5 100%)',
              border: '1px solid #4a85a5',
              borderRadius: '4px',
              padding: '4px 8px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)',
              display: 'inline-block',
            }}>
              <span style={{ color: '#fff', fontSize: '14px' }}>↗</span>
            </IgLink>
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
                <IgLink style={{
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
                </IgLink>

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
                    <IgLink style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRight: '1px solid #d0d0d0', display: 'block' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333', lineHeight: 1 }}>33</div>
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>photos</div>
                    </IgLink>
                    <IgLink style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRight: '1px solid #d0d0d0', display: 'block' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333', lineHeight: 1 }}>793</div>
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>followers</div>
                    </IgLink>
                    <IgLink style={{ flex: 1, textAlign: 'center', padding: '6px 0', display: 'block' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333', lineHeight: 1 }}>19</div>
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>following</div>
                    </IgLink>
                  </div>

                  {/* Follow button — exact 2012 blue */}
                  <IgLink style={{
                    display: 'block',
                    width: '100%',
                    background: 'linear-gradient(to bottom, #6db3d5 0%, #4a99c4 100%)',
                    border: '1px solid #3886b0',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '7px 0',
                    textAlign: 'center',
                    textShadow: '0 -1px 0 rgba(0,0,0,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.1)',
                  }}>Follow</IgLink>
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
                <IgLink style={{ fontSize: '13px', color: '#3b6d8c' }}>
                  welcometomywebsites.com
                </IgLink>
              </div>

              {/* Tabs: grid | list | photo map */}
              <div style={{
                display: 'flex',
                alignItems: 'stretch',
                borderBottom: '1px solid #efefef',
                background: '#fafafa',
              }}>
                {/* Grid tab — active */}
                <IgLink style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 0',
                  borderBottom: '2px solid #3b6d8c',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="#3b6d8c">
                    <rect x="0" y="0" width="5" height="5" /><rect x="6.5" y="0" width="5" height="5" /><rect x="13" y="0" width="5" height="5" />
                    <rect x="0" y="6.5" width="5" height="5" /><rect x="6.5" y="6.5" width="5" height="5" /><rect x="13" y="6.5" width="5" height="5" />
                    <rect x="0" y="13" width="5" height="5" /><rect x="6.5" y="13" width="5" height="5" /><rect x="13" y="13" width="5" height="5" />
                  </svg>
                </IgLink>
                {/* List tab */}
                <IgLink style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 0',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="#ccc">
                    <rect x="0" y="1" width="18" height="2" /><rect x="0" y="6" width="18" height="2" />
                    <rect x="0" y="11" width="18" height="2" /><rect x="0" y="16" width="18" height="2" />
                  </svg>
                </IgLink>
                {/* Photo Map */}
                <IgLink style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '5px', padding: '10px 0',
                }}>
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="#ccc">
                    <path d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                  </svg>
                  <span style={{ fontSize: '13px', color: '#999', fontWeight: '500' }}>Photo Map</span>
                  <span style={{ fontSize: '16px', color: '#ccc', fontWeight: '300' }}>›</span>
                </IgLink>
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
                  <IgLink key={i} style={{
                    aspectRatio: '1',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '28px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}>{item.emoji}</span>
                  </IgLink>
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
              <IgLink key={i} style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '22px',
                padding: '4px 0',
                opacity: tab.active ? 1 : 0.4,
                display: 'block',
                ...(tab.special ? {
                  background: 'linear-gradient(to bottom, #5d8fad, #3a6d8e)',
                  borderRadius: '5px',
                  margin: '0 6px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.3)',
                  opacity: 1,
                } : {}),
              }}>
                {tab.icon}
              </IgLink>
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

// Portfolio site component — early-2000s nostalgic mockup
function PortfolioSite({ page, onNavigate }: { page: string; onNavigate: (url: string) => void }) {
  const PORTFOLIO_URL = 'https://readymag.website/u2801101920/5411866/'
  const [stars, setStars] = useState<{x: number; y: number; size: number; delay: number}[]>([])

  useEffect(() => {
    setStars(Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    })))
  }, [])

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #000033 0%, #000066 40%, #330066 100%)',
      color: '#fff',
      fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
      overflow: 'auto',
      position: 'relative',
    }}>
      {/* Animated stars */}
      {stars.map((star, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          background: '#fff',
          borderRadius: '50%',
          animation: `twinkle 2s ease-in-out ${star.delay}s infinite alternate`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes twinkle { from { opacity: 0.2; } to { opacity: 1; } }
        @keyframes marquee { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        @keyframes rainbow { 0% { color: #ff0000; } 16% { color: #ff8800; } 33% { color: #ffff00; } 50% { color: #00ff00; } 66% { color: #0088ff; } 83% { color: #8800ff; } 100% { color: #ff0000; } }
        @keyframes glow { 0% { text-shadow: 0 0 5px #ff0, 0 0 10px #ff0; } 50% { text-shadow: 0 0 20px #0ff, 0 0 40px #0ff; } 100% { text-shadow: 0 0 5px #ff0, 0 0 10px #ff0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Top banner — animated rainbow marquee */}
        <div style={{
          background: 'linear-gradient(to right, #ff00ff, #00ffff, #ffff00)',
          padding: '3px 0',
          overflow: 'hidden',
          borderBottom: '2px solid #ff00ff',
        }}>
          <div style={{
            animation: 'marquee 12s linear infinite',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#000',
            fontFamily: '"Courier New", monospace',
          }}>
            ★ ★ ★ WELCOME TO MY DIGITAL CRIB ★ ★ ★ YOU ARE VISITOR #004,827 ★ ★ ★ BEST VIEWED IN INTERNET EXPLORER 6.0 ★ ★ ★ UNDER CONSTRUCTION ★ ★ ★
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '24px 20px 16px' }}>
          <h1 style={{
            fontSize: '32px',
            animation: 'rainbow 4s linear infinite, glow 3s ease-in-out infinite',
            margin: '0 0 4px',
            letterSpacing: '3px',
          }}>
            ✦ My Digital Crib ✦
          </h1>
          <p style={{ fontSize: '11px', color: '#aaa', fontFamily: '"Courier New", monospace', margin: 0 }}>
            — est. 2024 — creative portfolio & digital playground —
          </p>
        </div>

        {/* Animated separator */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#ff00ff', letterSpacing: '4px', margin: '4px 0 16px' }}>
          ·.·´¯`·.·★ ★·.·´¯`·.·★ ★·.·´¯`·.·
        </div>

        {/* Guestbook / links section */}
        <div style={{
          margin: '0 20px 16px',
          background: 'rgba(0, 0, 100, 0.6)',
          border: '2px ridge #6666ff',
          padding: '16px',
        }}>
          <h2 style={{ fontSize: '16px', color: '#ffff00', margin: '0 0 8px', textDecoration: 'underline' }}>
            🔗 cool links
          </h2>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
            <li><a href="https://www.instagram.com/mydigitalcrib/" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>📸 Instagram — @mydigitalcrib</a></li>
            <li><a href="https://ifyourereadingthishiremenow.my.canva.site" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff', textDecoration: 'none' }}>🎵 MySpace — vibes only</a></li>
            <li><a href="mailto:michellesalcedovallenilla@gmail.com" style={{ color: '#00ffff', textDecoration: 'none' }}>✉️ Contact — dm me!</a></li>
          </ul>
        </div>

        {/* ===== VISIT PORTFOLIO BUTTON ===== */}
        <div style={{ textAlign: 'center', margin: '24px 20px' }}>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: '"Comic Sans MS", cursive',
              border: '3px outset #FFD700',
              borderRadius: '0',
              textDecoration: 'none',
              textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              letterSpacing: '1px',
              cursor: 'pointer',
            }}
          >
            🌐 Visit My Main Portfolio ↗
          </a>
          <p style={{ fontSize: '10px', color: '#888', marginTop: '8px', fontFamily: '"Courier New", monospace' }}>
            (opens in a new tab)
          </p>
        </div>

        {/* Under construction banner */}
        <div style={{
          textAlign: 'center',
          padding: '12px',
          margin: '0 20px 20px',
          border: '2px dashed #ff0',
          background: 'rgba(255, 255, 0, 0.08)',
        }}>
          <span style={{ fontSize: '20px' }}>🚧</span>
          <span style={{ fontSize: '12px', color: '#ff0', marginLeft: '8px', fontFamily: '"Courier New", monospace' }}>
            UNDER CONSTRUCTION — MORE VIBES COMING SOON
          </span>
          <span style={{ fontSize: '20px' }}> 🚧</span>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          borderTop: '1px solid #333',
          fontSize: '10px',
          color: '#666',
          fontFamily: '"Courier New", monospace',
        }}>
          <p style={{ margin: '0 0 4px' }}>© 2024 mydigitalcrib · all rights reserved</p>
          <p style={{ margin: '0 0 4px' }}>made with ♥ and way too much caffeine</p>
          <p style={{ margin: 0, letterSpacing: '6px' }}>·.·´¯`·.·★·.·´¯`·.·</p>
        </div>
      </div>
    </div>
  )
}