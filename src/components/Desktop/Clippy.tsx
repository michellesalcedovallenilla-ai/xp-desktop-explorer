import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '../../store/useWindowStore'

const SPEECH_LINES = [
  "It looks like you're trying to hire Michelle! Great choice 👏",
  "Fun fact: this entire portfolio runs on vibes and caffeine ☕",
  "You've been staring at this screen for 3 minutes. Hire her already!",
  "It looks like you're procrastinating! Me too 📎",
  "Did you know Michelle made this whole thing? Yeah, I'm impressed too.",
  "I'm Clippy and I approve this portfolio ✅",
  "Stop scrolling LinkedIn and hire Michelle instead.",
  "This portfolio has more personality than most people I know.",
  "Try double-clicking the animals. Trust me.",
  "If you don't hire Michelle, I'll haunt your desktop forever 👻",
  "It looks like you're writing a rejection email... DON'T. 🚫",
  "I've been stuck in this computer since 2001. Send help. Or a job offer.",
  "Plot twist: the real portfolio was the friends we made along the way.",
  "Loading personality... ████████████ 100% ✨",
  "Michelle can design, code, AND tolerate me. That's talent.",
  "You can drag the animals around! I can't though. I'm stuck here. Forever.",
  "The cow has boots. That's it. That's the tip. 🐄👢",
  "PSA: No animals were harmed in the making of this portfolio.",
  "If this portfolio were a song, it'd be a banger 🎵",
  "You look like someone who appreciates good design. Am I right? 😏",
  "Pro tip: Click the sun! It's not just decoration ☀️",
  "I've seen your browsing history. Just kidding. Or am I? 👀",
  "Error 404: Reasons not to hire Michelle not found.",
  "This is giving ✨main character energy✨",
  "I'm legally required to tell you this portfolio slaps.",
]

export default function Clippy() {
  const [visible, setVisible] = useState(true)
  const [speech, setSpeech] = useState(SPEECH_LINES[0])
  const [showSpeech, setShowSpeech] = useState(false)
  const [bounce, setBounce] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const clippyRef = useRef<HTMLDivElement>(null)
  const prevWindowCount = useRef(0)

  // Track mouse position for eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Calculate pupil offset
  const getPupilTransform = useCallback(() => {
    if (!clippyRef.current) return 'translate(0px, 0px)'
    const rect = clippyRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + 40
    const dx = mousePos.x - cx
    const dy = mousePos.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxOffset = 4
    const scale = Math.min(maxOffset / (dist || 1), 0.015)
    return `translate(${dx * scale}px, ${dy * scale}px)`
  }, [mousePos])

  // Speech bubbles - first one at 4s, then every 30s
  useEffect(() => {
    const showTip = () => {
      const line = SPEECH_LINES[Math.floor(Math.random() * SPEECH_LINES.length)]
      setSpeech(line)
      setShowSpeech(true)
      setTimeout(() => setShowSpeech(false), 12000)
    }
    const firstTimer = setTimeout(showTip, 4000)
    const interval = setInterval(showTip, 30000)
    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [])

  // Bounce on new window
  const windows = useWindowStore((s) => s.windows)
  useEffect(() => {
    if (windows.length > prevWindowCount.current) {
      setBounce(true)
      setTimeout(() => setBounce(false), 400)
    }
    prevWindowCount.current = windows.length
  }, [windows.length])

  if (!visible) return null

  const pupilTransform = getPupilTransform()

  return (
    <div className="xp-clippy-container" ref={clippyRef}>
      <AnimatePresence>
        {showSpeech && (
          <motion.div
            className="xp-clippy-bubble"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className="xp-clippy-close"
              onClick={() => setShowSpeech(false)}
            >
              ×
            </button>
            <p className="clippy-speech-text">{speech}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="xp-clippy-img-wrapper"
        onClick={() => {
          const line =
            SPEECH_LINES[Math.floor(Math.random() * SPEECH_LINES.length)]
          setSpeech(line)
          setShowSpeech(true)
          setTimeout(() => setShowSpeech(false), 6000)
        }}
      >
        <button
          className="clippy-dismiss"
          onClick={(e) => {
            e.stopPropagation()
            setVisible(false)
          }}
          title="Dismiss Clippy"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'red',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>

        <img
          src="/reference/clippy.png"
          alt="Clippy"
          className="xp-clippy-img"
          draggable={false}
        />
      </div>
    </div>
  )
}
