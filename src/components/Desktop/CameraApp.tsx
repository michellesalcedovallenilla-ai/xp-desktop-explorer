import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Camera, Download, Trash2, X, Glasses, Crown } from 'lucide-react'

interface Photo {
  id: string
  dataUrl: string
}

const FILTERS = [
  { name: 'None', css: 'none' },
  { name: 'Sepia', css: 'sepia(1)' },
  { name: 'B&W', css: 'grayscale(1)' },
  { name: 'Vintage', css: 'sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)' },
  { name: 'VHS', css: 'saturate(1.8) contrast(1.3) brightness(0.85) hue-rotate(5deg)' },
  { name: 'Faded', css: 'contrast(0.8) brightness(1.15) saturate(0.6)' },
  { name: 'Warm', css: 'sepia(0.3) saturate(1.4) brightness(1.05)' },
  { name: 'Cool', css: 'saturate(0.8) brightness(1.05) hue-rotate(180deg) saturate(0.4) hue-rotate(-150deg)' },
  { name: 'High Con', css: 'contrast(1.6) brightness(0.95)' },
  { name: 'Retro TV', css: 'sepia(0.4) saturate(1.5) contrast(1.2) brightness(0.8)' },
  { name: 'Polaroid', css: 'sepia(0.15) contrast(1.1) brightness(1.1) saturate(1.2)' },
  { name: 'Noir', css: 'grayscale(1) contrast(1.4) brightness(0.85)' },
]

const SAMPLE_IMAGES = [
  '/animals/michelle.png',
  '/animals/cat.png',
  '/animals/cat ii.png',
  '/animals/cat flying.png',
  '/animals/chiguire.png',
  '/animals/cow iii.png',
  '/animals/dino.png',
  '/animals/fish flying.png',
  '/animals/oso.png',
  '/animals/pig flying.png',
]

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [heartsEnabled, setHeartsEnabled] = useState(false)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  const [flash, setFlash] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [activeFilter, setActiveFilter] = useState(0)
  const [sampleIndex, setSampleIndex] = useState(0)
  const [disguiseEnabled, setDisguiseEnabled] = useState(false)
  const [hatEnabled, setHatEnabled] = useState(false)
  const heartIdRef = useRef(0)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasCamera(true)
      }
    } catch {
      setHasCamera(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        ;(videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!heartsEnabled) return
    const interval = setInterval(() => {
      const id = heartIdRef.current++
      setHearts((prev) => [...prev, { id, x: 40 + Math.random() * 20, y: 80 }])
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id))
      }, 3000)
    }, 400)
    return () => clearInterval(interval)
  }, [heartsEnabled])

  const takePhoto = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (hasCamera && videoRef.current) {
      const video = videoRef.current
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      ctx.filter = FILTERS[activeFilter].css
      ctx.drawImage(video, 0, 0)
    } else {
      // Capture the sample image with filter
      const img = document.querySelector('.camera-sample-img') as HTMLImageElement
      if (!img) return
      canvas.width = img.naturalWidth || 400
      canvas.height = img.naturalHeight || 400
      ctx.filter = FILTERS[activeFilter].css
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }

    ctx.filter = 'none'
    const dataUrl = canvas.toDataURL('image/png')
    setPhotos((prev) => [{ id: Date.now().toString(), dataUrl }, ...prev])
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }, [hasCamera, activeFilter])

  const downloadPhoto = (dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `photo_${Date.now()}.png`
    a.click()
  }

  const cycleSample = () => {
    setSampleIndex((prev) => (prev + 1) % SAMPLE_IMAGES.length)
  }

  const filterStyle = FILTERS[activeFilter].css

  return (
    <div className="camera-app">
      <div className="camera-viewfinder" style={{ position: 'relative' }}>
        {hasCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ filter: filterStyle }}
          />
        ) : (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', background: '#111', overflow: 'hidden', cursor: 'pointer',
              position: 'relative'
            }}
            onClick={cycleSample}
          >
            <img
              src={SAMPLE_IMAGES[sampleIndex]}
              alt="Sample"
              className="camera-sample-img"
              crossOrigin="anonymous"
              style={{
                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                filter: filterStyle, transition: 'filter 0.3s ease'
              }}
            />
            <div style={{
              position: 'absolute', bottom: 6, left: 0, right: 0,
              textAlign: 'center', color: '#aaa', fontSize: 10,
              fontFamily: 'Tahoma, sans-serif', pointerEvents: 'none'
            }}>
              Click to change photo · Apply filters below!
            </div>
          </div>
        )}

        {/* Scanline overlay for retro feel */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          mixBlendMode: 'multiply'
        }} />

        {/* Disguise overlay */}
        {disguiseEnabled && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img
              src="/overlays/mustache-glasses.png"
              alt="Disguise"
              style={{ width: '55%', opacity: 0.9, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </div>
        )}

        {/* Hat overlay */}
        {hatEnabled && (
          <div style={{
            position: 'absolute', top: '-5%', left: 0, right: 0, pointerEvents: 'none',
            display: 'flex', justifyContent: 'center'
          }}>
            <img
              src="/overlays/hat.png"
              alt="Hat"
              style={{ width: '45%', opacity: 0.95, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}
            />
          </div>
        )}

        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              className="floating-heart"
              initial={{ x: `${heart.x}%`, y: `${heart.y}%`, opacity: 1, scale: 0.5 }}
              animate={{ y: '10%', opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Flash */}
        <AnimatePresence>
          {flash && (
            <motion.div
              className="camera-flash"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Filter strip */}
      <div style={{
        display: 'flex', gap: 2, padding: '4px 6px', overflowX: 'auto',
        background: '#1a1a1a', borderTop: '1px solid #333', borderBottom: '1px solid #333',
        flexShrink: 0
      }}>
        {FILTERS.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setActiveFilter(i)}
            style={{
              padding: '3px 8px', fontSize: 9, fontFamily: 'Tahoma, sans-serif',
              border: activeFilter === i ? '1px solid #6cf' : '1px solid #444',
              borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeFilter === i ? '#2a4a6a' : '#2a2a2a',
              color: activeFilter === i ? '#8cf' : '#aaa',
              transition: 'all 0.15s ease'
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="camera-controls">
        <button
          className={`camera-btn ${heartsEnabled ? 'active' : ''}`}
          onClick={() => setHeartsEnabled(!heartsEnabled)}
        >
          <Heart size={18} fill={heartsEnabled ? '#ff4466' : 'none'} />
        </button>
        <button
          className={`camera-btn ${hatEnabled ? 'active' : ''}`}
          onClick={() => setHatEnabled(!hatEnabled)}
          title="Hat"
        >
          <Crown size={18} color={hatEnabled ? '#ff4466' : undefined} />
        </button>
        <button className="camera-btn camera-shutter" onClick={takePhoto}>
          <div className="shutter-circle" />
        </button>
        <button
          className={`camera-btn ${disguiseEnabled ? 'active' : ''}`}
          onClick={() => setDisguiseEnabled(!disguiseEnabled)}
        >
          <Glasses size={18} color={disguiseEnabled ? '#ffcc00' : undefined} />
        </button>
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="camera-gallery">
          {photos.map((photo) => (
            <div key={photo.id} className="camera-thumb" onClick={() => setViewPhoto(photo.dataUrl)}>
              <img src={photo.dataUrl} alt="Captured" />
              <div className="thumb-actions">
                <button onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.dataUrl) }}>
                  <Download size={10} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setPhotos((p) => p.filter((pp) => pp.id !== photo.id)) }}>
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full View */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div
            className="camera-fullview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewPhoto(null)}
          >
            <button className="camera-fullview-close" onClick={() => setViewPhoto(null)}>
              <X size={20} />
            </button>
            <img src={viewPhoto} alt="Full view" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
