import { motion, AnimatePresence } from 'framer-motion'
import { useAudioStore } from '../../store/useAudioStore'
import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  title?: string
  message: string
  onClose: () => void
}

export default function XPErrorDialog({ isOpen, title = 'Error', message, onClose }: Props) {
  const { playError } = useAudioStore()

  useEffect(() => {
    if (isOpen) playError()
  }, [isOpen, playError])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{ position: 'absolute', inset: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'relative',
              minWidth: 280,
              maxWidth: 380,
              background: '#ECE9D8',
              border: '2px solid',
              borderColor: '#fff #808080 #808080 #fff',
              borderRadius: 3,
              boxShadow: '2px 2px 8px rgba(0,0,0,0.4)',
              fontFamily: 'Tahoma, Arial, sans-serif',
            }}
          >
            {/* Title Bar */}
            <div
              style={{
                background: 'linear-gradient(to right, #0A246A, #3A6EA5)',
                padding: '3px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '2px 2px 0 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{title}</span>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 18,
                  height: 18,
                  background: 'linear-gradient(to bottom, #F4C8C8, #C85050)',
                  border: '1px solid #500',
                  borderRadius: 2,
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>❌</span>
              <p style={{ fontSize: 11, color: '#000', lineHeight: 1.5, margin: 0 }}>
                {message}
              </p>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 20px 14px' }}>
              <button
                onClick={onClose}
                style={{
                  minWidth: 75,
                  padding: '3px 12px',
                  fontSize: 11,
                  fontFamily: 'Tahoma',
                  background: 'linear-gradient(to bottom, #fff, #E3DFC8)',
                  border: '1px solid #003C74',
                  borderRadius: 3,
                  cursor: 'pointer',
                  boxShadow: '0 0 0 1px #fff inset',
                }}
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
