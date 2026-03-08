import { useRef, useCallback, useState, useEffect } from 'react'
import { useWindowStore } from '../../store/useWindowStore'
import type { WindowState } from '../../types'
import Finder from './Finder'
import AboutViewer from './AboutViewer'
import ContactViewer from './ContactViewer'
import ResumeViewer from './ResumeViewer'
import CameraApp from './CameraApp'
import MusicPlayer from './MusicPlayer'
import ProjectViewer from './ProjectViewer'
import PaintApp from './PaintApp'
import MinesweeperApp from './MinesweeperApp'
import SolitaireApp from './SolitaireApp'
import InternetExplorer from './InternetExplorer'
import MSNMessenger from './MSNMessenger'
import VideoPlayer from './VideoPlayer'

const contentComponents: Record<string, React.ComponentType<any>> = {
  finder: Finder,
  about: AboutViewer,
  contact: ContactViewer,
  resume: ResumeViewer,
  camera: CameraApp,
  music: MusicPlayer,
  project: ProjectViewer,
  paint: PaintApp,
  minesweeper: MinesweeperApp,
  solitaire: SolitaireApp,
  ie: InternetExplorer,
  messenger: MSNMessenger,
  video: VideoPlayer
}

const typeIcons: Record<string, string> = {
  finder: '📁',
  about: '👤',
  contact: '✉️',
  resume: '📄',
  camera: '📷',
  music: '🎵',
  paint: '🎨',
  minesweeper: '💣',
  solitaire: '🃏',
  ie: '🌐',
  project: '📁',
  messenger: '💬'
}

interface Props {
  window: WindowState
}

export default function Window({ window: win }: Props) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    nextZIndex
  } = useWindowStore()
  const isFocused = win.zIndex === nextZIndex - 1
  const ContentComponent = contentComponents[win.type] || Finder
  const icon = typeIcons[win.type] || '📁'
  const hasOwnMenu = ['paint', 'minesweeper', 'solitaire', 'ie', 'music', 'messenger'].includes(
    win.type
  )

  // Responsive: detect mobile
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 480)
  const [isTabletView, setIsTabletView] = useState(window.innerWidth > 480 && window.innerWidth <= 768)
  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth
      setIsMobileView(vw <= 480)
      setIsTabletView(vw > 480 && vw <= 768)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const [isClosing, setIsClosing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [pos, setPos] = useState({ x: win.x, y: win.y })

  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 })

  useEffect(() => {
    if (!isDragging) setPos({ x: win.x, y: win.y })
  }, [win.x, win.y, isDragging])

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsClosing(true)
      setTimeout(() => closeWindow(win.id), 150)
    },
    [closeWindow, win.id]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (win.isMaximized || e.button !== 0) return
      e.stopPropagation()
      focusWindow(win.id)
      setIsDragging(true)
      document.body.style.userSelect = 'none'
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: pos.x,
        initialY: pos.y
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [win.isMaximized, win.id, focusWindow, pos.x, pos.y]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPos({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      })
    },
    [isDragging]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      setIsDragging(false)
      document.body.style.userSelect = ''
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch (err) {}

      const clampedX = Math.max(
        -win.width + 50,
        Math.min(window.innerWidth - 50, pos.x)
      )
      const clampedY = Math.max(0, Math.min(window.innerHeight - 50, pos.y))
      setPos({ x: clampedX, y: clampedY })
      moveWindow(win.id, clampedX, clampedY)
    },
    [isDragging, win.width, pos.x, pos.y, moveWindow, win.id]
  )

  // On mobile, force fullscreen-like behavior
  const effectiveMaximized = isMobileView || win.isMaximized
  // Calculate taskbar height based on viewport
  const taskbarHeight = isMobileView ? 40 : isTabletView ? 36 : 30

  return (
    <div
      className="xp-window-wrapper"
      onMouseDownCapture={() => focusWindow(win.id)}
      style={{
        display: win.isMinimized ? 'none' : 'block',
        position: 'absolute',
        zIndex: win.zIndex,
        width: effectiveMaximized ? '100vw' : Math.min(win.width, window.innerWidth - 8),
        height: effectiveMaximized ? `calc(100vh - ${taskbarHeight}px)` : Math.min(win.height, window.innerHeight - taskbarHeight - 10),
        left: 0,
        top: 0,
        transform: effectiveMaximized
          ? 'none'
          : `translate(${Math.min(pos.x, window.innerWidth - 100)}px, ${Math.max(0, pos.y)}px)`,
        opacity: isClosing ? 0 : 1,
        transition: isClosing ? 'opacity 150ms' : undefined,
        boxShadow: isFocused
          ? '0 4px 16px rgba(0,0,0,0.5)'
          : '0 2px 8px rgba(0,0,0,0.3)'
      }}
    >
      <div
        className="xp-window"
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: isDragging ? 'none' : 'auto'
        }}
      >
        {/* XP Title Bar */}
        <div
          className={`xp-titlebar ${!isFocused ? 'inactive' : ''}`}
          style={{
            pointerEvents: 'auto',
            cursor: effectiveMaximized ? 'default' : 'move'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => maximizeWindow(win.id)}
        >
          <div className="xp-titlebar-icon">{icon}</div>
          <span className="xp-titlebar-text">{win.title}</span>
          <div className="xp-window-controls">
            <button
              className="xp-win-btn xp-minimize"
              onClick={(e) => {
                e.stopPropagation()
                minimizeWindow(win.id)
              }}
              title="Minimize"
            >
              <svg viewBox="0 0 10 10" width="10" height="10">
                <rect x="1" y="7" width="8" height="2" fill="currentColor" />
              </svg>
            </button>
            <button
              className="xp-win-btn xp-maximize"
              onClick={(e) => {
                e.stopPropagation()
                maximizeWindow(win.id)
              }}
              title="Maximize"
            >
              <svg viewBox="0 0 10 10" width="10" height="10">
                <rect
                  x="1"
                  y="1"
                  width="8"
                  height="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              className="xp-win-btn xp-close"
              onClick={handleClose}
              title="Close"
            >
              <svg viewBox="0 0 10 10" width="10" height="10">
                <line
                  x1="2"
                  y1="2"
                  x2="8"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="2"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          </div>
        </div>

        {!hasOwnMenu && (
          <div className="xp-window-menubar">
            <button className="xp-wmenu-item">File</button>
            <button className="xp-wmenu-item">Edit</button>
            <button className="xp-wmenu-item">View</button>
            <button className="xp-wmenu-item">Help</button>
          </div>
        )}

        <div
          className="xp-window-content"
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        >
          <ContentComponent windowId={win.id} projectId={win.projectId} initialPath={win.url} />
        </div>

        {!['paint', 'ie', 'music', 'messenger'].includes(win.type) && (
          <div className="xp-window-statusbar">
            <span>{win.title}</span>
          </div>
        )}
      </div>
    </div>
  )
}
