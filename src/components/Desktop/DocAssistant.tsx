import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIPS = [
  'Did you know? Double-click any icon to open it!',
  'Try the Calculator! It does real math 🧮',
  'Check out Minesweeper in the Start Menu!',
  'You can drag windows by their title bar!',
  'Click the Start button to see all apps!',
  'Try MS Paint — draw something cool! 🎨',
  "Play Solitaire! It's a classic ♠️♥️",
  'Search Google in Internet Explorer!',
  'Windows XP was released October 25, 2001.',
  "Don't forget to send a message via Contact!"
]

export default function DocAssistant() {
  const [visible, setVisible] = useState(true)
  const [tip, setTip] = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const [blink, setBlink] = useState(false)
  const [lookDir, setLookDir] = useState(0) // -1 left, 0 center, 1 right

  // Show tips periodically
  useEffect(() => {
    const showTip = () => {
      const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)]
      setTip(randomTip)
      setShowBubble(true)
      setTimeout(() => setShowBubble(false), 6000)
    }
    // First tip after 5s
    const firstTimer = setTimeout(showTip, 5000)
    // Then every 25s
    const interval = setInterval(showTip, 25000)
    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [])

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setBlink(true)
        setTimeout(() => setBlink(false), 200)
      },
      3000 + Math.random() * 2000
    )
    return () => clearInterval(blinkInterval)
  }, [])

  // Look around
  useEffect(() => {
    const lookInterval = setInterval(
      () => {
        setLookDir(Math.floor(Math.random() * 3) - 1)
        setTimeout(() => setLookDir(0), 1500)
      },
      4000 + Math.random() * 3000
    )
    return () => clearInterval(lookInterval)
  }, [])

  if (!visible) return null

  return (
    <div className="doc-assistant">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            className="doc-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
          >
            <button
              className="doc-bubble-close"
              onClick={() => setShowBubble(false)}
            >
              ×
            </button>
            {tip}
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="doc-character"
        onClick={() => {
          setShowBubble(true)
          setTip(TIPS[Math.floor(Math.random() * TIPS.length)])
        }}
      >
        <button
          className="doc-dismiss"
          onClick={(e) => {
            e.stopPropagation()
            setVisible(false)
          }}
          title="Dismiss"
        >
          ×
        </button>
        {/* Doc the snail-like assistant with big eyes */}
        <svg width="80" height="90" viewBox="0 0 80 90" className="doc-svg">
          {/* Shell/body */}
          <ellipse cx="40" cy="60" rx="28" ry="22" fill="#8B7355" />
          <ellipse cx="40" cy="58" rx="24" ry="18" fill="#A0896C" />
          <ellipse cx="40" cy="55" rx="18" ry="14" fill="#C4A97D" />
          {/* Spiral on shell */}
          <path
            d="M40 48 Q48 48 48 55 Q48 62 40 62 Q35 62 35 57 Q35 53 40 53"
            fill="none"
            stroke="#8B7355"
            strokeWidth="2"
          />
          {/* Body/foot */}
          <ellipse cx="40" cy="78" rx="30" ry="8" fill="#7CB342" />
          <ellipse cx="40" cy="76" rx="28" ry="7" fill="#9CCC65" />
          {/* Head */}
          <circle cx="40" cy="35" r="16" fill="#9CCC65" />
          <circle cx="40" cy="35" r="14" fill="#AED581" />
          {/* Eye stalks */}
          <rect x="28" y="14" width="4" height="14" rx="2" fill="#9CCC65" />
          <rect x="48" y="14" width="4" height="14" rx="2" fill="#9CCC65" />
          {/* Eyes - big white circles */}
          <circle
            cx="30"
            cy="12"
            r="8"
            fill="white"
            stroke="#666"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="12"
            r="8"
            fill="white"
            stroke="#666"
            strokeWidth="1"
          />
          {/* Pupils - move based on lookDir */}
          <circle
            cx={30 + lookDir * 2}
            cy={blink ? 12 : 12}
            r={blink ? 1 : 4}
            fill="#333"
          />
          <circle
            cx={50 + lookDir * 2}
            cy={blink ? 12 : 12}
            r={blink ? 1 : 4}
            fill="#333"
          />
          {/* Pupil highlights */}
          {!blink && (
            <circle cx={29 + lookDir * 2} cy="10" r="1.5" fill="white" />
          )}
          {!blink && (
            <circle cx={49 + lookDir * 2} cy="10" r="1.5" fill="white" />
          )}
          {/* Mouth */}
          <path
            d="M34 40 Q40 44 46 40"
            fill="none"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <circle cx="26" cy="38" r="3" fill="rgba(255,150,150,0.3)" />
          <circle cx="54" cy="38" r="3" fill="rgba(255,150,150,0.3)" />
        </svg>
      </div>
    </div>
  )
}
