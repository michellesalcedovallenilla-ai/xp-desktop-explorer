import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useSystemStore } from '../../store/useSystemStore'
import { useWindowStore } from '../../store/useWindowStore'
import { useErrorDialogStore } from '../../store/useErrorDialogStore'

interface MenuItem {
  icon: string
  label: string
  bold?: boolean
  action: () => void
}

interface MenuSection {
  id: string
  label: string
  icon: string
  items: MenuItem[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function MobileStartMenu({ isOpen, onClose }: Props) {
  const { setSpotlightOpen, setLocked, setShutdownVisible } = useSystemStore()
  const { showError } = useErrorDialogStore()
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const openWindow = (type: string, title: string) => {
    const { openWindow: ow } = useWindowStore.getState()
    const vw = window.innerWidth
    const vh = window.innerHeight
    ow({
      id: `window-${type}`,
      title,
      type: type as any,
      x: 0,
      y: 0,
      width: vw,
      height: vh - 50,
      isMinimized: false,
      isMaximized: false
    })
    onClose()
    setActiveSection(null)
  }

  const programItems: MenuItem[] = [
    { icon: '🌐', label: 'Internet Explorer', bold: true, action: () => openWindow('ie', 'Internet Explorer') },
    { icon: '💻', label: 'My Computer', bold: true, action: () => openWindow('finder', 'My Computer') },
    { icon: '📁', label: 'My Documents', bold: true, action: () => openWindow('finder', 'My Documents') },
    { icon: '👤', label: 'About Me', action: () => openWindow('about', 'About Me') },
    { icon: '✉️', label: 'Contact', action: () => openWindow('contact', 'Contact') },
    { icon: '📄', label: 'Resume', action: () => openWindow('resume', 'Resume.pdf') },
    { icon: '📷', label: 'Camera', action: () => openWindow('camera', 'Camera') },
    { icon: '🎵', label: 'Music Player', action: () => openWindow('music', 'Windows Media Player') },
    { icon: '🎨', label: 'Paint', action: () => openWindow('paint', 'Paint') },
    { icon: '💣', label: 'Minesweeper', action: () => openWindow('minesweeper', 'Minesweeper') },
    { icon: '🃏', label: 'Solitaire', action: () => openWindow('solitaire', 'Solitaire') },
    { icon: '💬', label: 'MSN Messenger', action: () => openWindow('messenger', 'MSN Messenger') },
    { icon: '🔍', label: 'Search...', action: () => { setSpotlightOpen(true); onClose(); setActiveSection(null) } },
    { icon: '▶️', label: 'Run...', action: () => { setSpotlightOpen(true); onClose(); setActiveSection(null) } },
  ]

  const placesItems: MenuItem[] = [
    { icon: '📁', label: 'My Documents', action: () => openWindow('finder', 'My Documents') },
    { icon: '🖼️', label: 'My Pictures', action: () => openWindow('finder', 'My Pictures') },
    { icon: '🎶', label: 'My Music', action: () => openWindow('music', 'My Music') },
    { icon: '💻', label: 'My Computer', action: () => openWindow('finder', 'My Computer') },
    { icon: '⚙️', label: 'Control Panel', action: () => { showError('Control Panel', 'Access denied.'); onClose(); setActiveSection(null) } },
    { icon: '🖨️', label: 'Printers', action: () => { showError('Printers and Faxes', 'Windows cannot find any printers.'); onClose(); setActiveSection(null) } },
    { icon: '❓', label: 'Help and Support', action: () => { showError('Help and Support', 'Help is not available.'); onClose(); setActiveSection(null) } },
  ]

  const sections: MenuSection[] = [
    { id: 'programs', label: 'Programs', icon: '📋', items: programItems },
    { id: 'places', label: 'My Places', icon: '📂', items: placesItems },
  ]

  const activeItems = sections.find(s => s.id === activeSection)?.items

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="xp-mobile-start-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => { onClose(); setActiveSection(null) }}
          />

          {/* Menu panel */}
          <motion.div
            className="xp-mobile-start-menu"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="xp-start-header">
              <div className="xp-start-avatar">🐱</div>
              <span className="xp-start-username">Michelle Salcedo</span>
            </div>

            {/* Content area */}
            <div className="xp-mobile-start-content">
              <AnimatePresence mode="wait">
                {!activeSection ? (
                  /* Main menu — show sections + quick items */
                  <motion.div
                    key="main"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="xp-mobile-start-scroll"
                  >
                    {/* Quick access items */}
                    <button className="xp-mobile-start-item xp-start-item-bold" onClick={() => openWindow('ie', 'Internet Explorer')}>
                      <span className="xp-mobile-start-item-icon">🌐</span>
                      <span className="xp-mobile-start-item-label">Internet Explorer</span>
                    </button>
                    <button className="xp-mobile-start-item xp-start-item-bold" onClick={() => openWindow('finder', 'My Computer')}>
                      <span className="xp-mobile-start-item-icon">💻</span>
                      <span className="xp-mobile-start-item-label">My Computer</span>
                    </button>
                    <button className="xp-mobile-start-item xp-start-item-bold" onClick={() => openWindow('finder', 'My Documents')}>
                      <span className="xp-mobile-start-item-icon">📁</span>
                      <span className="xp-mobile-start-item-label">My Documents</span>
                    </button>

                    <div className="xp-start-sep" />

                    {/* Section folders */}
                    {sections.map(section => (
                      <button
                        key={section.id}
                        className="xp-mobile-start-item xp-mobile-start-folder"
                        onClick={() => setActiveSection(section.id)}
                      >
                        <span className="xp-mobile-start-item-icon">{section.icon}</span>
                        <span className="xp-mobile-start-item-label">{section.label}</span>
                        <ChevronRight size={16} className="xp-mobile-start-chevron" />
                      </button>
                    ))}

                    <div className="xp-start-sep" />

                    {/* Direct items */}
                    <button className="xp-mobile-start-item" onClick={() => openWindow('about', 'About Me')}>
                      <span className="xp-mobile-start-item-icon">👤</span>
                      <span className="xp-mobile-start-item-label">About Me</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('contact', 'Contact')}>
                      <span className="xp-mobile-start-item-icon">✉️</span>
                      <span className="xp-mobile-start-item-label">Contact</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('resume', 'Resume.pdf')}>
                      <span className="xp-mobile-start-item-icon">📄</span>
                      <span className="xp-mobile-start-item-label">Resume</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('camera', 'Camera')}>
                      <span className="xp-mobile-start-item-icon">📷</span>
                      <span className="xp-mobile-start-item-label">Camera</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('music', 'Windows Media Player')}>
                      <span className="xp-mobile-start-item-icon">🎵</span>
                      <span className="xp-mobile-start-item-label">Music Player</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('paint', 'Paint')}>
                      <span className="xp-mobile-start-item-icon">🎨</span>
                      <span className="xp-mobile-start-item-label">Paint</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('minesweeper', 'Minesweeper')}>
                      <span className="xp-mobile-start-item-icon">💣</span>
                      <span className="xp-mobile-start-item-label">Minesweeper</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('solitaire', 'Solitaire')}>
                      <span className="xp-mobile-start-item-icon">🃏</span>
                      <span className="xp-mobile-start-item-label">Solitaire</span>
                    </button>
                    <button className="xp-mobile-start-item" onClick={() => openWindow('messenger', 'MSN Messenger')}>
                      <span className="xp-mobile-start-item-icon">💬</span>
                      <span className="xp-mobile-start-item-label">MSN Messenger</span>
                    </button>

                    <div className="xp-start-sep" />

                    <button className="xp-mobile-start-item" onClick={() => { setSpotlightOpen(true); onClose(); }}>
                      <span className="xp-mobile-start-item-icon">🔍</span>
                      <span className="xp-mobile-start-item-label">Search...</span>
                    </button>
                  </motion.div>
                ) : (
                  /* Sub-panel */
                  <motion.div
                    key={activeSection}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="xp-mobile-start-scroll"
                  >
                    {/* Back button */}
                    <button
                      className="xp-mobile-start-item xp-mobile-start-back"
                      onClick={() => setActiveSection(null)}
                    >
                      <ChevronLeft size={18} />
                      <span className="xp-mobile-start-item-label" style={{ fontWeight: 700 }}>
                        ← Back
                      </span>
                    </button>
                    <div className="xp-start-sep" />

                    {activeItems?.map((item, i) => (
                      <button
                        key={i}
                        className={`xp-mobile-start-item ${item.bold ? 'xp-start-item-bold' : ''}`}
                        onClick={item.action}
                      >
                        <span className="xp-mobile-start-item-icon">{item.icon}</span>
                        <span className="xp-mobile-start-item-label">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="xp-start-footer xp-mobile-start-footer">
              <button
                className="xp-start-footer-btn"
                onClick={() => { setLocked(true); onClose(); setActiveSection(null) }}
              >
                <span>🔒</span> Log Off
              </button>
              <button
                className="xp-start-footer-btn"
                onClick={() => { setShutdownVisible(true); onClose(); setActiveSection(null) }}
              >
                <span>⏻</span> Turn Off
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
