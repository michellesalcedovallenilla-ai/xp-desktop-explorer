import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isOpen: boolean
  onClose: () => void
  onShutdown: () => void
}

export default function ShutdownDialog({ isOpen, onClose, onShutdown }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Dark Backdrop */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog Box */}
          <motion.div
            style={{
              position: 'relative',
              width: '300px',
              background:
                'linear-gradient(to bottom, #003399 0%, #002266 100%)',
              border: '1px solid #000',
              borderRadius: '4px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
              color: 'white',
              fontFamily: 'Tahoma, Arial, sans-serif'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Turn off computer
              </span>
              <div style={{ padding: '4px' }}>
                <img
                  src="/graphics/assets/windows-flag.png"
                  alt="Windows"
                  style={{ height: 24, filter: 'brightness(0) invert(1)' }}
                />
              </div>
            </div>

            {/* Body - Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                padding: '24px 12px 32px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    backgroundColor: '#FFFF00',
                    border: '1px solid #B8B800',
                    boxShadow:
                      'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid white',
                      borderRadius: '50%',
                      backgroundColor: '#CCCC00'
                    }}
                  />
                </button>
                <span
                  style={{
                    fontSize: '11px',
                    textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
                  }}
                >
                  Stand By
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <button
                  onClick={onShutdown}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    backgroundColor: '#FF3333',
                    border: '1px solid #CC0000',
                    boxShadow:
                      'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      lineHeight: 1
                    }}
                  >
                    ⏻
                  </span>
                </button>
                <span
                  style={{
                    fontSize: '11px',
                    textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
                  }}
                >
                  Turn Off
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    backgroundColor: '#00CC00',
                    border: '1px solid #009900',
                    boxShadow:
                      'inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '18px',
                      transform: 'rotate(45deg)'
                    }}
                  >
                    ↻
                  </span>
                </button>
                <span
                  style={{
                    fontSize: '11px',
                    textShadow: '1px 1px 1px rgba(0,0,0,0.8)'
                  }}
                >
                  Restart
                </span>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '12px'
              }}
            >
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#ECE9D8',
                  border: '1px outset #fff',
                  padding: '2px 12px',
                  fontSize: '11px',
                  color: 'black',
                  cursor: 'pointer',
                  fontFamily: 'Tahoma'
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
