import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore } from '../../store/useSystemStore'
import { useAudioStore } from '../../store/useAudioStore'

const PASSWORD = '1234'

export default function LockScreen() {
  const { isLocked, setLocked } = useSystemStore()
  const { playStartup } = useAudioStore()
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isAutoTyping, setIsAutoTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    (pwd?: string) => {
      const val = pwd || password
      if (val === PASSWORD) {
        setLocked(false)
        playStartup()
        setPassword('')
        setShowPasswordField(false)
        setIsAutoTyping(false)
      } else {
        setShake(true)
        setTimeout(() => setShake(false), 600)
        setPassword('')
      }
    },
    [password, setLocked]
  )

  const startAutoType = useCallback(() => {
    if (isAutoTyping) return
    setIsAutoTyping(true)
    setPassword('')

    // Type each character with 100ms delay
    PASSWORD.split('').forEach((_, index) => {
      setTimeout(
        () => {
          setPassword(PASSWORD.slice(0, index + 1))
        },
        (index + 1) * 100
      )
    })

    // Auto-submit after last character + 500ms
    setTimeout(
      () => {
        handleSubmit(PASSWORD)
      },
      PASSWORD.length * 100 + 500
    )
  }, [isAutoTyping, handleSubmit])

  const handleUserClick = () => {
    if (!showPasswordField) {
      setShowPasswordField(true)
      // Start auto-type after the field animates in
      setTimeout(() => startAutoType(), 300)
    } else if (!isAutoTyping) {
      startAutoType()
    }
  }

  const handleFieldClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAutoTyping) {
      startAutoType()
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          className="xp-login-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, delay: 0.2 }}
        >
          {/* Top Bar */}
          <div className="xp-login-topbar">
            <div className="xp-login-topbar-text">
              To begin, click your user name
            </div>
          </div>

          {/* Center Content */}
          <div className="xp-login-center">
            {/* Left - Windows XP branding */}
            <div className="xp-login-branding">
              <div className="xp-flag xp-flag-login">
                <div className="xp-flag-pane xp-flag-red" />
                <div className="xp-flag-pane xp-flag-green" />
                <div className="xp-flag-pane xp-flag-blue" />
                <div className="xp-flag-pane xp-flag-yellow" />
              </div>
              <div className="xp-login-brand-text">
                <span className="xp-login-ms">Microsoft</span>
                <span className="xp-login-winxp">
                  Windows<em>XP</em>
                </span>
              </div>
            </div>

            {/* Right - User accounts */}
            <div className="xp-login-users">
              <motion.button
                className={`xp-user-card ${showPasswordField ? 'selected' : ''}`}
                onClick={handleUserClick}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="xp-user-avatar">🐱</div>
                <div className="xp-user-info">
                  <span className="xp-user-name">Michelle Salcedo</span>
                  {!showPasswordField && (
                    <span className="xp-user-hint">Password protected</span>
                  )}
                  {showPasswordField && (
                    <motion.form
                      onSubmit={handleFormSubmit}
                      className="xp-password-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: 'auto',
                        x: shake ? [0, -8, 8, -8, 8, 0] : 0
                      }}
                      transition={shake ? { duration: 0.4 } : { duration: 0.2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="xp-password-row">
                        <input
                          ref={inputRef}
                          type="password"
                          className="xp-password-input"
                          placeholder={isAutoTyping ? '' : 'Type your password'}
                          value={password}
                          onChange={(e) => {
                            if (!isAutoTyping) setPassword(e.target.value)
                          }}
                          onClick={handleFieldClick}
                          readOnly={isAutoTyping}
                          autoFocus
                        />
                        <button type="submit" className="xp-password-go">
                          →
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>
              </motion.button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="xp-login-bottombar">
            <button className="xp-login-bottom-btn">
              <span className="xp-shutdown-icon">⏻</span> Turn off computer
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
