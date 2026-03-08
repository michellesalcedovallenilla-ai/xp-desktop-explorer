import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore } from '../../store/useSystemStore'

export default function BootAnimation() {
  const { isBooting, setBooting } = useSystemStore()

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 3500)
    return () => clearTimeout(timer)
  }, [setBooting])

  return (
    <AnimatePresence>
      {isBooting && (
        <motion.div
          className="boot-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Windows XP Flag Logo */}
          <motion.div
            className="xp-boot-logo"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="xp-flag">
              <div className="xp-flag-pane xp-flag-red" />
              <div className="xp-flag-pane xp-flag-green" />
              <div className="xp-flag-pane xp-flag-blue" />
              <div className="xp-flag-pane xp-flag-yellow" />
            </div>
            <div className="xp-boot-text">
              <span className="xp-boot-windows">Microsoft</span>
              <span className="xp-boot-xp">
                Windows<em>XP</em>
              </span>
            </div>
          </motion.div>

          {/* Loading Progress Bar */}
          <motion.div
            className="xp-boot-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="xp-progress-track">
              <motion.div
                className="xp-progress-blocks"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <div className="xp-progress-block" />
                <div className="xp-progress-block" />
                <div className="xp-progress-block" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
