import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Download, Trash2, X, Glasses, Crown } from 'lucide-react'

interface Photo {
  id: string
  dataUrl: string
}

interface FaceBox {
  x: number
  y: number
  width: number
  height: number
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
  '/animals/cat-ii.png',
  '/animals/cat-flying.png',
  '/animals/chiguire.png',
  '/animals/cow-iii.png',
  '/animals/dino.png',
  '/animals/fish-flying.png',
  '/animals/oso.png',
  '/animals/pig-flying.png',
]

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewfinderRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceDetectorRef = useRef<any>(null)
  const faceLoopRef = useRef<number>(0)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [heartsEnabled, setHeartsEnabled] = useState(false)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  const [flash, setFlash] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState(0)
  const [sampleIndex, setSampleIndex] = useState(0)
  const [disguiseEnabled, setDisguiseEnabled] = useState(false)
  const [hatEnabled, setHatEnabled] = useState(false)
  const [faceBox, setFaceBox] = useState<FaceBox | null>(null)
  const heartIdRef = useRef(0)

  // Initialize FaceDetector if available
  useEffect(() => {
    if ('FaceDetector' in window) {
      try {
        faceDetectorRef.current = new (window as any).FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1,
        })
      } catch {
        faceDetectorRef.current = null
      }
    }
    return () => {
      cancelAnimationFrame(faceLoopRef.current)
    }
  }, [])

  // Face detection loop
  const runFaceDetection = useCallback(async () => {
    if (!faceDetectorRef.current || !videoRef.current || !hasCamera) return
    const video = videoRef.current
    if (video.readyState < 2) {
      faceLoopRef.current = requestAnimationFrame(runFaceDetection)
      return
    }

    try {
      const faces = await faceDetectorRef.current.detect(video)
      if (faces.length > 0) {
        const face = faces[0]
        const vw = video.videoWidth
        const vh = video.videoHeight
        const container = viewfinderRef.current
        if (container && vw && vh) {
          const cw = container.clientWidth
          const ch = container.clientHeight
          // Video is object-fit: cover/contain — compute scale
          const scale = Math.min(cw / vw, ch / vh)
          const offsetX = (cw - vw * scale) / 2
          const offsetY = (ch - vh * scale) / 2

          // Mirror the x coordinate since video is mirrored
          const mirroredX = vw - face.boundingBox.x - face.boundingBox.width

          setFaceBox({
            x: mirroredX * scale + offsetX,
            y: face.boundingBox.y * scale + offsetY,
            width: face.boundingBox.width * scale,
            height: face.boundingBox.height * scale,
          })
        }
      } else {
        setFaceBox(null)
      }
    } catch {
      // FaceDetector may fail on some frames
    }

    faceLoopRef.current = requestAnimationFrame(runFaceDetection)
  }, [hasCamera])

  useEffect(() => {
    if (hasCamera && (disguiseEnabled || hatEnabled)) {
      faceLoopRef.current = requestAnimationFrame(runFaceDetection)
    } else {
      cancelAnimationFrame(faceLoopRef.current)
      if (!disguiseEnabled && !hatEnabled) setFaceBox(null)
    }
    return () => cancelAnimationFrame(faceLoopRef.current)
  }, [hasCamera, disguiseEnabled, hatEnabled, runFaceDetection])

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = stream
      setHasCamera(true)
      setCameraError(null)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setHasCamera(false)
      const message = err instanceof Error ? err.message : 'Could not access camera'
      setCameraError(message)
    }
  }, [])

  useEffect(() => {
    if (hasCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [hasCamera])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
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
      const img = document.querySelector('.camera-sample-img') as HTMLImageElement
      if (!img) return
      canvas.width = img.naturalWidth || 400
      canvas.height = img.naturalHeight || 400
      ctx.filter = FILTERS[activeFilter].css
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }

    ctx.filter = 'none'

    // Draw overlays onto captured photo if face detected
    if (faceBox && hasCamera && videoRef.current) {
      const video = videoRef.current
      const vw = video.videoWidth
      const vh = video.videoHeight
      const container = viewfinderRef.current
      if (container && vw && vh) {
        const cw = container.clientWidth
        const ch = container.clientHeight
        const scale = Math.min(cw / vw, ch / vh)
        const offsetX = (cw - vw * scale) / 2
        const offsetY = (ch - vh * scale) / 2
        // Convert faceBox back to video coordinates
        const fx = (faceBox.x - offsetX) / scale
        const fy = (faceBox.y - offsetY) / scale
        const fw = faceBox.width / scale
        const fh = faceBox.height / scale

        const drawOverlay = (src: string, yRatio: number, hRatio: number) => {
          const img = new Image()
          img.src = src
          // These are sync if cached
          if (img.complete) {
            const ow = fw * 1.1
            const oh = fh * hRatio
            const ox = fx + (fw - ow) / 2
            const oy = fy + fh * yRatio
            ctx.drawImage(img, ox, oy, ow, oh)
          }
        }

        if (disguiseEnabled) {
          drawOverlay('/overlays/glasses.png', 0.25, 0.25)
          drawOverlay('/overlays/mustache.png', 0.6, 0.2)
        }
        if (hatEnabled) {
          const img = new Image()
          img.src = '/overlays/hat.png'
          if (img.complete) {
            const ow = fw * 1.3
            const oh = fh * 0.5
            const ox = fx + (fw - ow) / 2
            const oy = fy - oh * 0.7
            ctx.drawImage(img, ox, oy, ow, oh)
          }
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png')
    setPhotos((prev) => [{ id: Date.now().toString(), dataUrl }, ...prev])
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }, [hasCamera, activeFilter, faceBox, disguiseEnabled, hatEnabled])

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
  const hasFaceApi = 'FaceDetector' in window

  // Compute overlay positions from faceBox
  const glassesStyle: React.CSSProperties | null =
    disguiseEnabled && faceBox
      ? {
          position: 'absolute',
          left: faceBox.x + faceBox.width * -0.05,
          top: faceBox.y + faceBox.height * 0.22,
          width: faceBox.width * 1.1,
          height: faceBox.height * 0.28,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
          transition: 'all 0.08s linear',
        }
      : null

  const mustacheStyle: React.CSSProperties | null =
    disguiseEnabled && faceBox
      ? {
          position: 'absolute',
          left: faceBox.x + faceBox.width * 0.1,
          top: faceBox.y + faceBox.height * 0.58,
          width: faceBox.width * 0.8,
          height: faceBox.height * 0.22,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
          transition: 'all 0.08s linear',
        }
      : null

  const hatStyle: React.CSSProperties | null =
    hatEnabled && faceBox
      ? {
          position: 'absolute',
          left: faceBox.x + faceBox.width * -0.15,
          top: faceBox.y - faceBox.height * 0.45,
          width: faceBox.width * 1.3,
          height: faceBox.height * 0.55,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
          transition: 'all 0.08s linear',
        }
      : null

  // Fallback: center overlays if no FaceDetector or no face found
  const showCenteredDisguise = disguiseEnabled && (!hasFaceApi || !faceBox)
  const showCenteredHat = hatEnabled && (!hasFaceApi || !faceBox)

  return (
    <div className="camera-app">
      <div className="camera-viewfinder" ref={viewfinderRef} style={{ position: 'relative' }}>
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
              height: '100%', background: '#111', overflow: 'hidden',
              position: 'relative', flexDirection: 'column', gap: 12
            }}
          >
            <button
              onClick={startCamera}
              style={{
                padding: '10px 24px', fontSize: 13, fontFamily: 'Tahoma, sans-serif',
                background: '#2a4a6a', color: '#8cf', border: '1px solid #6cf',
                borderRadius: 4, cursor: 'pointer', zIndex: 2
              }}
            >
              📷 {cameraError ? 'Retry Camera' : 'Start Camera'}
            </button>
            {cameraError && (
              <div style={{ color: '#ff8a8a', fontSize: 10, fontFamily: 'Tahoma, sans-serif', textAlign: 'center', maxWidth: 280 }}>
                {cameraError}
              </div>
            )}
            <div style={{ color: '#666', fontSize: 11, fontFamily: 'Tahoma, sans-serif' }}>
              Or browse sample photos:
            </div>
            <div style={{ cursor: 'pointer', maxWidth: '80%', maxHeight: '50%' }} onClick={cycleSample}>
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
            </div>
            <div style={{
              textAlign: 'center', color: '#aaa', fontSize: 10,
              fontFamily: 'Tahoma, sans-serif', pointerEvents: 'none'
            }}>
              Click image to change · Apply filters below!
            </div>
          </div>
        )}

        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          mixBlendMode: 'multiply'
        }} />

        {/* Face-tracked glasses */}
        {glassesStyle && (
          <img src="/overlays/glasses.png" alt="Glasses" style={glassesStyle} />
        )}
        {/* Face-tracked mustache */}
        {mustacheStyle && (
          <img src="/overlays/mustache.png" alt="Mustache" style={mustacheStyle} />
        )}
        {/* Face-tracked hat */}
        {hatStyle && (
          <img src="/overlays/hat.png" alt="Hat" style={hatStyle} />
        )}

        {/* Centered fallback disguise */}
        {showCenteredDisguise && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 4
          }}>
            <img src="/overlays/glasses.png" alt="Glasses"
              style={{ width: '40%', opacity: 0.9, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <img src="/overlays/mustache.png" alt="Mustache"
              style={{ width: '30%', opacity: 0.9, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
          </div>
        )}

        {/* Centered fallback hat */}
        {showCenteredHat && (
          <div style={{
            position: 'absolute', top: '5%', left: 0, right: 0, pointerEvents: 'none',
            display: 'flex', justifyContent: 'center'
          }}>
            <img src="/overlays/hat.png" alt="Hat"
              style={{ width: '45%', opacity: 0.95, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} />
          </div>
        )}

        {/* Floating hearts */}
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
        {flash && (
          <div
            className="camera-flash"
            style={{
              position: 'absolute', inset: 0, background: 'white',
              opacity: 1, pointerEvents: 'none',
              animation: 'flashFade 0.2s ease-out forwards'
            }}
          />
        )}
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
      {viewPhoto && (
        <div
          className="camera-fullview"
          onClick={() => setViewPhoto(null)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
        >
          <button className="camera-fullview-close" onClick={() => setViewPhoto(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={20} />
          </button>
          <img src={viewPhoto} alt="Full view" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}
