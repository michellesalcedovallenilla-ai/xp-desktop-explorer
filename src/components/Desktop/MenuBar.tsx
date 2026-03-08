import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Wifi, Volume2 } from 'lucide-react'
import { useSystemStore } from '../../store/useSystemStore'
import { useWindowStore } from '../../store/useWindowStore'
import { useErrorDialogStore } from '../../store/useErrorDialogStore'
import { useClock } from '../../hooks/useClock'

export default function MenuBar() {
  const { isSpotlightOpen, setSpotlightOpen, setLocked, setShutdownVisible, widgets, toggleWidget } =
    useSystemStore()
  const { windows, minimizeWindow, restoreWindow, focusWindow } =
    useWindowStore()
  const { showError } = useErrorDialogStore()
  const [startOpen, setStartOpen] = useState(false)
  const startRef = useRef<HTMLDivElement>(null)
  const time = useClock()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const openWindow = (type: string, title: string) => {
    const { openWindow: ow } = useWindowStore.getState()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const isMobile = vw <= 480
    const isTablet = vw > 480 && vw <= 768
    const isSmallLaptop = vw > 768 && vw <= 1024
    const sz = (mobile: number, tablet: number, smallLaptop: number, desktop: number) =>
      isMobile ? mobile : isTablet ? tablet : isSmallLaptop ? smallLaptop : desktop
    const sizes: Record<string, { w: number; h: number }> = {
      minesweeper: { w: sz(vw, 320, 300, 320), h: sz(vh - 50, 420, 380, 420) },
      solitaire: { w: sz(vw, 500, 550, 700), h: sz(vh - 50, 550, 450, 550) },
      paint: { w: sz(vw, 500, 550, 700), h: sz(vh - 50, 500, 420, 500) },
      camera: { w: sz(vw, 480, 480, 640), h: sz(vh - 50, 420, 380, 520) },
      music: { w: sz(vw, 480, 500, 700), h: sz(vh - 50, 420, 400, 500) },
      ie: { w: sz(vw, 600, 650, 850), h: sz(vh - 50, 450, 420, 600) },
      contact: { w: sz(vw, 480, 450, 600), h: sz(vh - 50, 420, 380, 500) },
      resume: { w: sz(vw, 500, 500, 650), h: sz(vh - 50, 450, 420, 550) },
      about: { w: sz(vw, 500, 520, 700), h: sz(vh - 50, 420, 400, 500) },
      finder: { w: sz(vw, 500, 550, 750), h: sz(vh - 50, 400, 380, 450) },
      messenger: { w: sz(vw, 420, 400, 500), h: sz(vh - 50, 450, 420, 550) },
    }
    const s = sizes[type] || { w: sz(vw, 700, 550, 700), h: sz(vh - 50, 500, 420, 500) }
    const x = isMobile ? 0 : isTablet ? Math.random() * 40 : 100 + Math.random() * 150
    const y = isMobile ? 0 : isTablet ? Math.random() * 30 : 50 + Math.random() * 80
    ow({
      id: `window-${type}`,
      title,
      type: type as any,
      x,
      y,
      width: s.w,
      height: s.h,
      isMinimized: false,
      isMaximized: false
    })
    setStartOpen(false)
  }

  const visibleWindows = windows.filter((w) => !w.isMinimized)

  return (
    <div className="xp-taskbar">
      {/* Start Button */}
      <div className="xp-start-area" ref={startRef}>
        <button
          className={`xp-start-btn ${startOpen ? 'active' : ''}`}
          onClick={() => setStartOpen(!startOpen)}
        >
          <img
            src="/38216057e97f444799f1d66485241a79.png"
            alt="start"
            style={{
              width: 22,
              height: 22,
              marginRight: 4,
              filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))'
            }}
            draggable={false}
          />
          <span>start</span>
        </button>

        {/* Start Menu */}
        <AnimatePresence>
          {startOpen && (
            <motion.div
              className="xp-start-menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="xp-start-header">
                <div className="xp-start-avatar">🐱</div>
                <span className="xp-start-username">Michelle Salcedo</span>
              </div>

              {/* Body */}
              <div className="xp-start-body">
                {/* Left column - Programs */}
                <div className="xp-start-left">
                  <button
                    className="xp-start-item xp-start-item-bold"
                    onClick={() => openWindow('ie', 'Internet Explorer')}
                  >
                    <span className="xp-start-item-icon">🌐</span> Internet
                    Explorer
                  </button>
                  <button
                    className="xp-start-item xp-start-item-bold"
                    onClick={() => openWindow('finder', 'My Computer')}
                  >
                    <span className="xp-start-item-icon">💻</span> My Computer
                  </button>
                  <button
                    className="xp-start-item xp-start-item-bold"
                    onClick={() => openWindow('finder', 'My Documents')}
                  >
                    <span className="xp-start-item-icon">📁</span> My Documents
                  </button>
                  <div className="xp-start-sep" />
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('about', 'About Me')}
                  >
                    <span className="xp-start-item-icon">👤</span> About Me
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('contact', 'Contact')}
                  >
                    <span className="xp-start-item-icon">✉️</span> Contact
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('resume', 'Resume.pdf')}
                  >
                    <span className="xp-start-item-icon">📄</span> Resume
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('camera', 'Camera')}
                  >
                    <span className="xp-start-item-icon">📷</span> Camera
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('music', 'Windows Media Player')}
                  >
                    <span className="xp-start-item-icon">🎵</span> Music Player
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('paint', 'Paint')}
                  >
                    <span className="xp-start-item-icon">🎨</span> Paint
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('minesweeper', 'Minesweeper')}
                  >
                    <span className="xp-start-item-icon">💣</span> Minesweeper
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('solitaire', 'Solitaire')}
                  >
                    <span className="xp-start-item-icon">🃏</span> Solitaire
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('messenger', 'MSN Messenger')}
                  >
                    <span className="xp-start-item-icon">💬</span> MSN Messenger
                  </button>
                  <div className="xp-start-sep" />
                  <button
                    className="xp-start-item"
                    onClick={() => {
                      setSpotlightOpen(true)
                      setStartOpen(false)
                    }}
                  >
                    <span className="xp-start-item-icon">🔍</span> Search...
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => {
                      setSpotlightOpen(true)
                      setStartOpen(false)
                    }}
                  >
                    <span className="xp-start-item-icon">▶️</span> Run...
                  </button>
                </div>

                {/* Right column - Places */}
                <div className="xp-start-right">
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('finder', 'My Documents')}
                  >
                    <span className="xp-start-item-icon">📁</span> My Documents
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('finder', 'My Pictures')}
                  >
                    <span className="xp-start-item-icon">🖼️</span> My Pictures
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('music', 'My Music')}
                  >
                    <span className="xp-start-item-icon">🎶</span> My Music
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => openWindow('finder', 'My Computer')}
                  >
                    <span className="xp-start-item-icon">💻</span> My Computer
                  </button>
                  <div className="xp-start-sep" />
                  <button
                    className="xp-start-item"
                    onClick={() => {
                      showError('Control Panel', 'Access denied. You do not have permission to access the Control Panel.')
                      setStartOpen(false)
                    }}
                  >
                    <span className="xp-start-item-icon">⚙️</span> Control Panel
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => {
                      showError('Printers and Faxes', 'Windows cannot find any printers. Make sure a printer is connected and try again.')
                      setStartOpen(false)
                    }}
                  >
                    <span className="xp-start-item-icon">🖨️</span> Printers
                  </button>
                  <button
                    className="xp-start-item"
                    onClick={() => {
                      showError('Help and Support', 'Help is not available. This program has performed an illegal operation.')
                      setStartOpen(false)
                    }}
                  >
                    <span className="xp-start-item-icon">❓</span> Help and
                    Support
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="xp-start-footer">
                <button
                  className="xp-start-footer-btn"
                  onClick={() => setLocked(true)}
                >
                  <span>🔒</span> Log Off
                </button>
                <button
                  className="xp-start-footer-btn"
                  onClick={() => {
                    setShutdownVisible(true)
                    setStartOpen(false)
                  }}
                >
                  <span>⏻</span> Turn Off Computer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Launch */}
      <div className="xp-quick-launch">
        <button className="xp-ql-btn" title="Show Desktop" onClick={() => {
          showError('Explorer.exe', 'This program has performed an illegal operation and will be shut down.')
        }}>
          🖥️
        </button>
        <button
          className="xp-ql-btn"
          title="Internet Explorer"
          onClick={() => openWindow('ie', 'Internet Explorer')}
        >
          🌐
        </button>
        <button
          className="xp-ql-btn"
          title="Windows Media Player"
          onClick={() => openWindow('music', 'Windows Media Player')}
        >
          🎵
        </button>
      </div>

      <div className="xp-taskbar-divider" />

      {/* Running Windows */}
      <div className="xp-running-apps">
        {/* Widget taskbar buttons */}
        {widgets
          .filter((w) => w.type !== 'music')
          .map((widget) => (
          <button
            key={widget.id}
            className={`xp-task-btn widget-btn ${widget.isVisible ? 'active' : ''}`}
            onClick={() => toggleWidget(widget.id)}
          >
            {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
          </button>
        ))}
        {/* Music Player taskbar button - opens as window */}
        <button
          className={`xp-task-btn widget-btn ${windows.some(w => w.id === 'window-music' && !w.isMinimized) ? 'active' : ''}`}
          onClick={() => {
            const musicWin = windows.find(w => w.id === 'window-music')
            if (musicWin) {
              if (musicWin.isMinimized) {
                restoreWindow(musicWin.id)
              } else {
                minimizeWindow(musicWin.id)
              }
            } else {
              openWindow('music', 'Windows Media Player')
            }
          }}
        >
          Music
        </button>
        {/* Window taskbar buttons */}
        {windows.filter(win => win.id !== 'window-music').map((win) => (
          <button
            key={win.id}
            className={`xp-task-btn ${!win.isMinimized ? 'active' : ''}`}
            onClick={() => {
              if (win.isMinimized) {
                restoreWindow(win.id)
              } else {
                minimizeWindow(win.id)
              }
            }}
          >
            {win.title}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="xp-system-tray">
        <div className="xp-tray-icons">
          <Volume2 size={14} />
          <Wifi size={14} />
          <Search
            size={14}
            onClick={() => setSpotlightOpen(true)}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="xp-tray-clock">
          {time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </div>
      </div>
    </div>
  )
}
