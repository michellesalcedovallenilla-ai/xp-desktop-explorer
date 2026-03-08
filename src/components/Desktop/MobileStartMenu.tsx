import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore } from '../../store/useSystemStore'
import { useWindowStore } from '../../store/useWindowStore'
import { useErrorDialogStore } from '../../store/useErrorDialogStore'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function MobileStartMenu({ isOpen, onClose }: Props) {
  const { setSpotlightOpen, setLocked, setShutdownVisible } = useSystemStore()
  const { showError } = useErrorDialogStore()

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
  }

  const items = [
    { icon: '🌐', label: 'Internet Explorer', bold: true, action: () => openWindow('ie', 'Internet Explorer') },
    { icon: '💻', label: 'My Computer', bold: true, action: () => openWindow('finder', 'My Computer') },
    { icon: '📁', label: 'My Documents', bold: true, action: () => openWindow('finder', 'My Documents') },
    null, // separator
    { icon: '👤', label: 'About Me', action: () => openWindow('about', 'About Me') },
    { icon: '✉️', label: 'Contact', action: () => openWindow('contact', 'Contact') },
    { icon: '📄', label: 'Resume', action: () => openWindow('resume', 'Resume.pdf') },
    { icon: '📷', label: 'Camera', action: () => openWindow('camera', 'Camera') },
    { icon: '🎵', label: 'Music Player', action: () => openWindow('music', 'Windows Media Player') },
    { icon: '🎨', label: 'Paint', action: () => openWindow('paint', 'Paint') },
    { icon: '💣', label: 'Minesweeper', action: () => openWindow('minesweeper', 'Minesweeper') },
    { icon: '🃏', label: 'Solitaire', action: () => openWindow('solitaire', 'Solitaire') },
    { icon: '💬', label: 'MSN Messenger', action: () => openWindow('messenger', 'MSN Messenger') },
    null, // separator
    { icon: '🔍', label: 'Search...', action: () => { setSpotlightOpen(true); onClose() } },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="xp-mobile-start-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          <motion.div
            className="xp-mobile-start-menu"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="xp-start-header">
              <div className="xp-start-avatar">🐱</div>
              <span className="xp-start-username">Michelle Salcedo</span>
            </div>

            <div className="xp-mobile-start-content">
              <div className="xp-mobile-start-scroll">
                {items.map((item, i) =>
                  item === null ? (
                    <div key={`sep-${i}`} className="xp-start-sep" />
                  ) : (
                    <button
                      key={i}
                      className={`xp-mobile-start-item ${item.bold ? 'xp-start-item-bold' : ''}`}
                      onClick={item.action}
                    >
                      <span className="xp-mobile-start-item-icon">{item.icon}</span>
                      <span className="xp-mobile-start-item-label">{item.label}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="xp-start-footer xp-mobile-start-footer">
              <button
                className="xp-start-footer-btn"
                onClick={() => { setLocked(true); onClose() }}
              >
                <span>🔒</span> Log Off
              </button>
              <button
                className="xp-start-footer-btn"
                onClick={() => { setShutdownVisible(true); onClose() }}
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
