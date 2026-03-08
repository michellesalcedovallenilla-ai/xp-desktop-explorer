import { useEffect, useRef, useState, useCallback } from 'react'
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

// Preload overlay images so they're available for canvas drawing
const overlayImages: Record<string, HTMLImageElement> = {}
function preloadOverlay(src: string) {
  if (!overlayImages[src]) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    overlayImages[src] = img
  }
  return overlayImages[src]
}

// Preload all overlays on module load
preloadOverlay('/overlays/glasses.png')
preloadOverlay('/overlays/mustache.png')
preloadOverlay('/overlays/hat.png')

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewfinderRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceDetectorRef = useRef<any>(null)
  const faceLoopRef = useRef<number>(0)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [heartsEnabled, setHeartsEnabled] = useState(false)
  const [flash, setFlash] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState(0)
  const [sampleIndex, setSampleIndex] = useState(0)
  const [disguiseEnabled, setDisguiseEnabled] = useState(false)
  const [hatEnabled, setHatEnabled] = useState(false)
  const [faceBox, setFaceBox] = useState<FaceBox | null>(null)

  // Track raw face box in video coords for photo capture
  const rawFaceRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)

  const anyOverlay = disguiseEnabled || hatEnabled || heartsEnabled

  // Initialize FaceDetector
  useEffect(() => {
    if ('FaceDetector' in window) {
      try {
        faceDetectorRef.current = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
      } catch { faceDetectorRef.current = null }
    }
    return () => cancelAnimationFrame(faceLoopRef.current)
  }, [])

  // Face detection loop — runs when any overlay is active
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
        const bb = faces[0].boundingBox
        const vw = video.videoWidth
        const vh = video.videoHeight
        const container = viewfinderRef.current
        if (container && vw && vh) {
          const cw = container.clientWidth
          const ch = container.clientHeight
          const scale = Math.min(cw / vw, ch / vh)
          const offsetX = (cw - vw * scale) / 2
          const offsetY = (ch - vh * scale) / 2
          const mirroredX = vw - bb.x - bb.width

          rawFaceRef.current = { x: mirroredX, y: bb.y, w: bb.width, h: bb.height }
          setFaceBox({
            x: mirroredX * scale + offsetX,
            y: bb.y * scale + offsetY,
            width: bb.width * scale,
            height: bb.height * scale,
          })
        }
      } else {
        rawFaceRef.current = null
        setFaceBox(null)
      }
    } catch { /* ignore */ }

    faceLoopRef.current = requestAnimationFrame(runFaceDetection)
  }, [hasCamera])

  useEffect(() => {
    if (hasCamera && anyOverlay) {
      faceLoopRef.current = requestAnimationFrame(runFaceDetection)
    } else {
      cancelAnimationFrame(faceLoopRef.current)
      if (!anyOverlay) { setFaceBox(null); rawFaceRef.current = null }
    }
    return () => cancelAnimationFrame(faceLoopRef.current)
  }, [hasCamera, anyOverlay, runFaceDetection])

  // Camera start
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API not supported')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = stream
      setHasCamera(true)
      setCameraError(null)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      setHasCamera(false)
      setCameraError(err instanceof Error ? err.message : 'Could not access camera')
    }
  }, [])

  useEffect(() => {
    if (hasCamera && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current
  }, [hasCamera])

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }, [])

  // Take photo — draws video + filter + overlays onto canvas
  const takePhoto = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 640, h = 480
    if (hasCamera && videoRef.current) {
      const video = videoRef.current
      w = video.videoWidth || 640
      h = video.videoHeight || 480
      canvas.width = w
      canvas.height = h

      // Mirror the canvas to match the mirrored video display
      ctx.save()
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
      ctx.filter = FILTERS[activeFilter].css
      ctx.drawImage(video, 0, 0)
      ctx.restore()
    } else {
      const img = document.querySelector('.camera-sample-img') as HTMLImageElement
      if (!img) return
      w = img.naturalWidth || 400
      h = img.naturalHeight || 400
      canvas.width = w
      canvas.height = h
      ctx.filter = FILTERS[activeFilter].css
      ctx.drawImage(img, 0, 0, w, h)
    }

    ctx.filter = 'none'

    // Draw overlays using raw face coords (already mirrored in rawFaceRef)
    const rf = rawFaceRef.current
    if (rf) {
      const fx = rf.x, fy = rf.y, fw = rf.w, fh = rf.h

      if (disguiseEnabled) {
        const glasses = overlayImages['/overlays/glasses.png']
        if (glasses?.complete) {
          const ow = fw * 1.1, oh = fh * 0.28
          ctx.drawImage(glasses, fx + (fw - ow) / 2, fy + fh * 0.22, ow, oh)
        }
        const mustache = overlayImages['/overlays/mustache.png']
        if (mustache?.complete) {
          const ow = fw * 0.8, oh = fh * 0.22
          ctx.drawImage(mustache, fx + (fw - ow) / 2, fy + fh * 0.58, ow, oh)
        }
      }

      if (hatEnabled) {
        const hat = overlayImages['/overlays/hat.png']
        if (hat?.complete) {
          const ow = fw * 1.3, oh = fh * 0.55
          ctx.drawImage(hat, fx + (fw - ow) / 2, fy - oh * 0.7, ow, oh)
        }
      }

      if (heartsEnabled) {
        ctx.textAlign = 'center'
        ctx.font = `${Math.round(fh * 0.2)}px serif`
        const heartPositions = [
          { dx: 0, dy: -fh * 0.35 },
          { dx: -fw * 0.25, dy: -fh * 0.45 },
          { dx: fw * 0.25, dy: -fh * 0.45 },
        ]
        for (const hp of heartPositions) {
          ctx.fillText('❤️', fx + fw / 2 + hp.dx, fy + hp.dy)
        }
      }
    } else if (heartsEnabled) {
      // fallback when no face is detected
      const baseSize = Math.max(28, Math.round(h * 0.08))
      ctx.textAlign = 'center'
      ctx.font = `${baseSize}px serif`
      const cx = w / 2
      const cy = h * 0.2
      ctx.fillText('❤️', cx, cy)
      ctx.fillText('❤️', cx - baseSize * 0.9, cy + baseSize * 0.05)
      ctx.fillText('❤️', cx + baseSize * 0.9, cy + baseSize * 0.05)
    }

    const dataUrl = canvas.toDataURL('image/png')
    setPhotos((prev) => [{ id: Date.now().toString(), dataUrl }, ...prev])
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }, [hasCamera, activeFilter, disguiseEnabled, hatEnabled, heartsEnabled])

  const downloadPhoto = (dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `photo_${Date.now()}.png`
    a.click()
  }

  const cycleSample = () => setSampleIndex((prev) => (prev + 1) % SAMPLE_IMAGES.length)

  const filterStyle = FILTERS[activeFilter].css
  const hasFaceApi = 'FaceDetector' in window

  // Build overlay styles from faceBox (display coordinates)
  const makeOverlayStyle = (
    xOffset: number, yOffset: number,
    wMul: number, hMul: number
  ): React.CSSProperties | null => {
    if (!faceBox) return null
    return {
      position: 'absolute',
      left: faceBox.x + faceBox.width * xOffset,
      top: faceBox.y + faceBox.height * yOffset,
      width: faceBox.width * wMul,
      height: faceBox.height * hMul,
      pointerEvents: 'none',
      zIndex: 10,
      objectFit: 'contain',
      transition: 'all 0.06s linear',
    }
  }

  const glassesStyle = disguiseEnabled ? makeOverlayStyle(-0.05, 0.22, 1.1, 0.28) : null
  const mustacheStyle = disguiseEnabled ? makeOverlayStyle(0.1, 0.58, 0.8, 0.22) : null
  const hatStyle = hatEnabled ? makeOverlayStyle(-0.15, -0.5, 1.3, 0.55) : null

  const showCenteredDisguise = disguiseEnabled && (!hasFaceApi || !faceBox) && hasCamera
  const showCenteredHat = hatEnabled && (!hasFaceApi || !faceBox) && hasCamera
  const showCenteredHearts = heartsEnabled && (!faceBox || !hasFaceApi) && hasCamera

  // Hearts above head (display)
  const heartOverlays = heartsEnabled && faceBox ? [
    { dx: 0, dy: -0.4, size: 0.18 },
    { dx: -0.2, dy: -0.5, size: 0.15 },
    { dx: 0.2, dy: -0.5, size: 0.15 },
    { dx: -0.1, dy: -0.6, size: 0.12 },
    { dx: 0.1, dy: -0.6, size: 0.12 },
  ] : []

  return (
    <div className="camera-app">
      <div className="camera-viewfinder" ref={viewfinderRef} style={{ position: 'relative', overflow: 'hidden' }}>
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
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', background: '#111', overflow: 'hidden',
            position: 'relative', flexDirection: 'column', gap: 12
          }}>
            <button onClick={startCamera} style={{
              padding: '10px 24px', fontSize: 13, fontFamily: 'Tahoma, sans-serif',
              background: '#2a4a6a', color: '#8cf', border: '1px solid #6cf',
              borderRadius: 4, cursor: 'pointer', zIndex: 2
            }}>
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
              <img src={SAMPLE_IMAGES[sampleIndex]} alt="Sample" className="camera-sample-img" crossOrigin="anonymous"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: filterStyle, transition: 'filter 0.3s ease' }} />
            </div>
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 10, fontFamily: 'Tahoma, sans-serif', pointerEvents: 'none' }}>
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

        {/* Face-tracked overlays */}
        {glassesStyle && <img src="/overlays/glasses.png" alt="" style={glassesStyle} />}
        {mustacheStyle && <img src="/overlays/mustache.png" alt="" style={mustacheStyle} />}
        {hatStyle && <img src="/overlays/hat.png" alt="" style={hatStyle} />}

        {/* Face-tracked hearts above head */}
        {faceBox && heartOverlays.map((h, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: faceBox.x + faceBox.width * (0.5 + h.dx) - faceBox.width * h.size / 2,
            top: faceBox.y + faceBox.height * h.dy,
            fontSize: faceBox.width * h.size,
            pointerEvents: 'none',
            zIndex: 10,
            transition: 'all 0.06s linear',
            filter: 'drop-shadow(0 2px 4px rgba(255,0,0,0.4))',
          }}>
            ❤️
          </div>
        ))}

        {/* Centered fallbacks */}
        {showCenteredDisguise && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4
          }}>
            <img src="/overlays/glasses.png" alt="" style={{ width: '40%', opacity: 0.9 }} />
            <img src="/overlays/mustache.png" alt="" style={{ width: '30%', opacity: 0.9 }} />
          </div>
        )}
        {showCenteredHat && (
          <div style={{ position: 'absolute', top: '5%', left: 0, right: 0, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
            <img src="/overlays/hat.png" alt="" style={{ width: '45%', opacity: 0.95 }} />
          </div>
        )}

        {/* Centered heart fallback */}
        {showCenteredHearts && (
          <div style={{
            position: 'absolute', top: '10%', left: 0, right: 0,
            pointerEvents: 'none', display: 'flex', justifyContent: 'center', gap: 14, zIndex: 10
          }}>
            <span style={{ fontSize: 34, filter: 'drop-shadow(0 2px 4px rgba(255,0,0,0.4))' }}>❤️</span>
            <span style={{ fontSize: 28, transform: 'translateY(8px)', filter: 'drop-shadow(0 2px 4px rgba(255,0,0,0.4))' }}>❤️</span>
            <span style={{ fontSize: 34, filter: 'drop-shadow(0 2px 4px rgba(255,0,0,0.4))' }}>❤️</span>
          </div>
        )}

        {/* Flash */}
        {flash && (
          <div style={{
            position: 'absolute', inset: 0, background: 'white',
            pointerEvents: 'none', animation: 'flashFade 0.2s ease-out forwards'
          }} />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Filter strip */}
      <div style={{
        display: 'flex', gap: 2, padding: '4px 6px', overflowX: 'auto',
        background: '#1a1a1a', borderTop: '1px solid #333', borderBottom: '1px solid #333', flexShrink: 0
      }}>
        {FILTERS.map((f, i) => (
          <button key={f.name} onClick={() => setActiveFilter(i)} style={{
            padding: '3px 8px', fontSize: 9, fontFamily: 'Tahoma, sans-serif',
            border: activeFilter === i ? '1px solid #6cf' : '1px solid #444',
            borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap',
            background: activeFilter === i ? '#2a4a6a' : '#2a2a2a',
            color: activeFilter === i ? '#8cf' : '#aaa', transition: 'all 0.15s ease'
          }}>
            {f.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="camera-controls">
        <button className={`camera-btn ${heartsEnabled ? 'active' : ''}`} onClick={() => setHeartsEnabled(!heartsEnabled)}>
          <Heart size={18} fill={heartsEnabled ? '#ff4466' : 'none'} />
        </button>
        <button className={`camera-btn ${hatEnabled ? 'active' : ''}`} onClick={() => setHatEnabled(!hatEnabled)} title="Hat">
          <Crown size={18} color={hatEnabled ? '#ff4466' : undefined} />
        </button>
        <button className="camera-btn camera-shutter" onClick={takePhoto}>
          <div className="shutter-circle" />
        </button>
        <button className={`camera-btn ${disguiseEnabled ? 'active' : ''}`} onClick={() => setDisguiseEnabled(!disguiseEnabled)}>
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
                <button onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.dataUrl) }}><Download size={10} /></button>
                <button onClick={(e) => { e.stopPropagation(); setPhotos((p) => p.filter((pp) => pp.id !== photo.id)) }}><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full View */}
      {viewPhoto && (
        <div onClick={() => setViewPhoto(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <button onClick={() => setViewPhoto(null)} style={{
            position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'white', cursor: 'pointer'
          }}><X size={20} /></button>
          <img src={viewPhoto} alt="Full view" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}
