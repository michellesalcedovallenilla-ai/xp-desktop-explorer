import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore } from '../../store/useSystemStore'

export default function WakeEffect() {
  const { isLocked, setLocked, isBooting } = useSystemStore()
  const [showFlash, setShowFlash] = useState(false)

  useEffect(() => {
    const handler = () => {
      if (document.hidden) return
      if (!isBooting && !isLocked) {
        setShowFlash(true)
        setTimeout(() => {
          setShowFlash(false)
          setLocked(true)
        }, 300)
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [isBooting, isLocked, setLocked])

  return (
    <AnimatePresence>
      {showFlash && (
        <motion.div
          className="wake-flash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  )
}
