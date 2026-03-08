import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  FolderOpen,
  User,
  Mail,
  FileText,
  Camera,
  Music as MusicIcon,
  Calculator,
  Cloud,
  Clock,
  CalendarDays,
  StickyNote
} from 'lucide-react'
import { useSystemStore } from '../../store/useSystemStore'
import { useWindowStore } from '../../store/useWindowStore'

interface SearchItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  type: string
  action: () => void
}

export default function Spotlight() {
  const { isSpotlightOpen, setSpotlightOpen, toggleWidget, widgets } =
    useSystemStore()
  const { openWindow } = useWindowStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSpotlightOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isSpotlightOpen])

  const openApp = (type: string, title: string) => {
    openWindow({
      id: `window-${type}`,
      title,
      type: type as any,
      x: 100 + Math.random() * 150,
      y: 50 + Math.random() * 80,
      width: 700,
      height: 500,
      isMinimized: false,
      isMaximized: false
    })
    setSpotlightOpen(false)
  }

  const items: SearchItem[] = useMemo(
    () => [
      {
        id: 'finder',
        label: 'My Computer',
        icon: FolderOpen,
        type: 'Program',
        action: () => openApp('finder', 'My Computer')
      },
      {
        id: 'about',
        label: 'About Me',
        icon: User,
        type: 'Program',
        action: () => openApp('about', 'About Me')
      },
      {
        id: 'contact',
        label: 'Contact',
        icon: Mail,
        type: 'Program',
        action: () => openApp('contact', 'Contact')
      },
      {
        id: 'resume',
        label: 'Resume',
        icon: FileText,
        type: 'Document',
        action: () => openApp('resume', 'Resume.pdf')
      },
      {
        id: 'camera',
        label: 'Camera',
        icon: Camera,
        type: 'Program',
        action: () => openApp('camera', 'Camera')
      },
      {
        id: 'music',
        label: 'Windows Media Player',
        icon: MusicIcon,
        type: 'Program',
        action: () => openApp('music', 'Windows Media Player')
      },
      {
        id: 'calculator',
        label: 'Calculator',
        icon: Calculator,
        type: 'Accessory',
        action: () => {
          const w = widgets.find((w) => w.id === 'calculator')
          if (w && !w.isVisible) toggleWidget('calculator')
          setSpotlightOpen(false)
        }
      },
      {
        id: 'weather',
        label: 'Weather',
        icon: Cloud,
        type: 'Accessory',
        action: () => {
          const w = widgets.find((w) => w.id === 'weather')
          if (w && !w.isVisible) toggleWidget('weather')
          setSpotlightOpen(false)
        }
      },
      {
        id: 'clock',
        label: 'Clock',
        icon: Clock,
        type: 'Accessory',
        action: () => {
          const w = widgets.find((w) => w.id === 'clock')
          if (w && !w.isVisible) toggleWidget('clock')
          setSpotlightOpen(false)
        }
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: CalendarDays,
        type: 'Accessory',
        action: () => {
          const w = widgets.find((w) => w.id === 'calendar')
          if (w && !w.isVisible) toggleWidget('calendar')
          setSpotlightOpen(false)
        }
      },
      {
        id: 'notes',
        label: 'Notepad',
        icon: StickyNote,
        type: 'Accessory',
        action: () => {
          const w = widgets.find((w) => w.id === 'notes')
          if (w && !w.isVisible) toggleWidget('notes')
          setSpotlightOpen(false)
        }
      }
    ],
    [widgets, toggleWidget, setSpotlightOpen]
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    return items.filter((i) =>
      i.label.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, items])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[selectedIndex]?.action()
    } else if (e.key === 'Escape') {
      setSpotlightOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {isSpotlightOpen && (
        <motion.div
          className="xp-run-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSpotlightOpen(false)}
        >
          <motion.div
            className="xp-run-dialog"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* XP Window Title Bar */}
            <div className="xp-run-titlebar">
              <span>🔍 Search</span>
              <button
                className="xp-run-close"
                onClick={() => setSpotlightOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="xp-run-body">
              <div className="xp-run-input-row">
                <Search size={16} />
                <input
                  ref={inputRef}
                  className="xp-run-input"
                  placeholder="Type the name of a program, folder, or document..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {filtered.length > 0 ? (
                <div className="xp-run-results">
                  {filtered.map((item, i) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        className={`xp-run-result ${i === selectedIndex ? 'selected' : ''}`}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        <Icon size={16} />
                        <span className="xp-run-result-label">
                          {item.label}
                        </span>
                        <span className="xp-run-result-type">{item.type}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="xp-run-empty">
                  Windows cannot find the specified program.
                </div>
              )}
              <div className="xp-run-buttons">
                <button
                  className="xp-btn"
                  onClick={() => filtered[selectedIndex]?.action()}
                >
                  OK
                </button>
                <button
                  className="xp-btn"
                  onClick={() => setSpotlightOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
