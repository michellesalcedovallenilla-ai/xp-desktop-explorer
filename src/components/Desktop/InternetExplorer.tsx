import { useState, useRef } from 'react'

const PORTFOLIO_URL = 'https://readymag.website/u2801101920/5411866/'
const INSTAGRAM_URL = 'https://www.instagram.com/mydigitaldrafts/'
const GOOGLE_URL = 'https://www.google.com/'

interface Props {
  windowId: string
}

export default function InternetExplorer({ windowId }: Props) {
  const [addressBar, setAddressBar] = useState(GOOGLE_URL)
  const [currentUrl, setCurrentUrl] = useState(GOOGLE_URL)
  const [history, setHistory] = useState<string[]>([GOOGLE_URL])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const navigateTo = (url: string) => {
    let finalUrl = url
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('www')) {
      // Treat as search if no protocol
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
    // Quick state cycle to trigger iframe reload or re-render
    const temp = currentUrl
    setCurrentUrl('about:blank')
    setTimeout(() => setCurrentUrl(temp), 50)
  }

  const isGoogleHome =
    currentUrl === GOOGLE_URL ||
    currentUrl === 'https://google.com' ||
    currentUrl === 'http://www.google.com'
  const isGoogleSearch = currentUrl.startsWith(`${GOOGLE_URL}search`)

  const renderContent = () => {
    if (isGoogleHome) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '20px',
              letterSpacing: '-3px'
            }}
          >
            <span style={{ color: '#4285F4' }}>G</span>
            <span style={{ color: '#EA4335' }}>o</span>
            <span style={{ color: '#FBBC05' }}>o</span>
            <span style={{ color: '#4285F4' }}>g</span>
            <span style={{ color: '#34A853' }}>l</span>
            <span style={{ color: '#EA4335' }}>e</span>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                fontSize: '16px',
                borderRadius: '24px',
                border: '1px solid #dfe1e5',
                outline: 'none',
                marginBottom: '20px'
              }}
              placeholder="Search Google or type a URL"
              autoFocus
            />
            <div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  color: '#3c4043',
                  cursor: 'pointer',
                  fontSize: '14px',
                  margin: '0 5px'
                }}
              >
                Google Search
              </button>
              <button
                type="button"
                onClick={() => navigateTo(PORTFOLIO_URL)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  color: '#3c4043',
                  cursor: 'pointer',
                  fontSize: '14px',
                  margin: '0 5px'
                }}
              >
                I'm Feeling Lucky
              </button>
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
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #ebebeb',
              paddingBottom: '15px',
              marginBottom: '20px',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginRight: '30px'
              }}
            >
              <span style={{ color: '#4285F4' }}>G</span>
              <span style={{ color: '#EA4335' }}>o</span>
              <span style={{ color: '#FBBC05' }}>o</span>
              <span style={{ color: '#4285F4' }}>g</span>
              <span style={{ color: '#34A853' }}>l</span>
              <span style={{ color: '#EA4335' }}>e</span>
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                navigateTo(`${GOOGLE_URL}search?q=${encodeURIComponent(query)}`)
              }}
              style={{ flex: 1, maxWidth: '600px', display: 'flex' }}
            >
              <input
                type="text"
                defaultValue={query}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 15px',
                  fontSize: '16px',
                  borderRadius: '24px 0 0 24px',
                  border: '1px solid #dfe1e5',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 20px',
                  borderRadius: '0 24px 24px 0',
                  border: '1px solid #dfe1e5',
                  borderLeft: 'none',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                🔍
              </button>
            </form>
          </div>

          <p
            style={{ color: '#70757a', fontSize: '14px', marginBottom: '20px' }}
          >
            About 2 results (0.01 seconds)
          </p>

          <div style={{ marginBottom: '30px', maxWidth: '600px' }}>
            <div
              style={{
                fontSize: '14px',
                color: '#202124',
                marginBottom: '2px'
              }}
            >
              readymag.website › u2801101920
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigateTo(PORTFOLIO_URL)
              }}
              style={{
                fontSize: '20px',
                color: '#1a0dab',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              My Digital Drafts - Portfolio
            </a>
            <div
              style={{ color: '#4d5156', fontSize: '14px', lineHeight: '1.4' }}
            >
              Explore the creative portfolio and digital works. A collection of
              projects, designs, and interactive experiences.
            </div>
          </div>

          <div style={{ marginBottom: '30px', maxWidth: '600px' }}>
            <div
              style={{
                fontSize: '14px',
                color: '#202124',
                marginBottom: '2px'
              }}
            >
              instagram.com › mydigitaldrafts
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigateTo(INSTAGRAM_URL)
              }}
              style={{
                fontSize: '20px',
                color: '#1a0dab',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              My Digital Drafts (@mydigitaldrafts) • Instagram photos
            </a>
            <div
              style={{ color: '#4d5156', fontSize: '14px', lineHeight: '1.4' }}
            >
              See Instagram photos and videos from My Digital Drafts
              (@mydigitaldrafts). Follow for the latest design updates and
              drops.
            </div>
          </div>
        </div>
      )
    }

    // Default to iframe for external sites
    return (
      <iframe
        id={`ie-iframe-${windowId}`}
        src={currentUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#fff',
          display: 'block'
        }}
        title="Internet Explorer Browser"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    )
  }

  return (
    <div
      className="xp-ie"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Toolbar */}
      <div
        className="xp-ie-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          backgroundColor: '#ECE9D8',
          borderBottom: '1px solid #ACA899'
        }}
      >
        <button
          className="xp-ie-nav"
          onClick={handleBack}
          disabled={historyIndex === 0}
          title="Back"
          style={{
            opacity: historyIndex === 0 ? 0.5 : 1,
            fontSize: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '4px',
            color: historyIndex === 0 ? '#999' : '#000'
          }}
        >{`◄`}</button>
        <button
          className="xp-ie-nav"
          onClick={handleForward}
          disabled={historyIndex === history.length - 1}
          title="Forward"
          style={{
            opacity: historyIndex === history.length - 1 ? 0.5 : 1,
            fontSize: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '8px',
            color: historyIndex === history.length - 1 ? '#999' : '#000'
          }}
        >{`►`}</button>
        <button
          className="xp-ie-nav"
          onClick={handleRefresh}
          title="Refresh"
          style={{
            fontSize: '18px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          ✖
        </button>
        <button
          className="xp-ie-nav"
          onClick={handleGoHome}
          title="Home"
          style={{
            fontSize: '18px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '12px'
          }}
        >
          🏠
        </button>

        <form
          className="xp-ie-address"
          onSubmit={handleAddressSubmit}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            border: '1px solid #7F9DB9',
            padding: '2px'
          }}
        >
          <span
            className="xp-ie-address-label"
            style={{
              padding: '0 8px',
              fontSize: '12px',
              color: '#555',
              borderRight: '1px solid #CCC'
            }}
          >
            Address
          </span>
          <input
            className="xp-ie-address-input"
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '2px 8px',
              fontSize: '12px',
              fontFamily: 'Tahoma'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'url(/icons/go_xp.png) no-repeat center',
              backgroundSize: 'contain',
              width: '20px',
              height: '20px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '10px' }}>Go</span>
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div
        className="xp-ie-content"
        style={{
          flex: 1,
          backgroundColor: '#fff',
          margin: 0,
          padding: 0,
          overflow: 'auto'
        }}
      >
        {renderContent()}
      </div>

      {/* Status Bar */}
      <div
        className="xp-ie-statusbar"
        style={{
          height: '22px',
          backgroundColor: '#ECE9D8',
          borderTop: '1px solid #ACA899',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          fontSize: '11px',
          color: '#333'
        }}
      >
        <span style={{ flex: 1 }}>Done</span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderLeft: '1px solid #ACA899',
            paddingLeft: '8px'
          }}
        >
          🌐 Internet
        </span>
      </div>
    </div>
  )
}
