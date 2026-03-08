import { useEffect, useRef, useState, useCallback } from 'react'
import { Heart, Download, Trash2, X, Glasses, Crown, Beer, Smile } from 'lucide-react'
import { useMediaPipeTracking, type FaceLandmarks, type HandPosition } from '@/hooks/useMediaPipeTracking'

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
  '/animals/cat-ii.png',
  '/animals/cat-flying.png',
  '/animals/chiguire.png',
  '/animals/cow-iii.png',
  '/animals/dino.png',
  '/animals/fish-flying.png',
  '/animals/oso.png',
  '/animals/pig-flying.png',
]

const OVERLAY_PATHS = {
  glasses: '/overlays/glasses.png',
  mustache: '/overlays/mustache.png',
  hat: '/overlays/hat.png',
  polarcita: '/overlays/polarcita.png',
}

// Preload overlay images for canvas drawing
const overlayImages: Record<string, HTMLImageElement> = {}
function preloadOverlay(key: string, src: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src
  overlayImages[key] = img
}
Object.entries(OVERLAY_PATHS).forEach(([key, src]) => preloadOverlay(key, src))

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewfinderRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [flash, setFlash] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState(0)
  const [sampleIndex, setSampleIndex] = useState(0)

  // Overlay toggles
  const [glassesOn, setGlassesOn] = useState(false)
  const [mustacheOn, setMustacheOn] = useState(false)
  const [hatOn, setHatOn] = useState(false)
  const [heartsOn, setHeartsOn] = useState(false)
  const [beerOn, setBeerOn] = useState(false)

  const anyOverlay = glassesOn || mustacheOn || hatOn || heartsOn || beerOn

  // MediaPipe tracking
  const { face, hand, ready: trackingReady } = useMediaPipeTracking(
    videoRef,
    hasCamera && anyOverlay
  )

  // Camera start
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API not supported')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      streamRef.current?.getTracks().forEach(t => t.stop())
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
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null }
  }, [])

  // Draw overlays on a canvas context given face/hand landmarks (in pixel coords)
  const drawOverlays = useCallback((
    ctx: CanvasRenderingContext2D,
    w: number, h: number,
    f: FaceLandmarks | null,
    hd: HandPosition | null
  ) => {
    if (f) {
      const eyeCenterX = ((f.leftEye.x + f.rightEye.x) / 2) * w
      const eyeCenterY = ((f.leftEye.y + f.rightEye.y) / 2) * h
      const eyeDistancePx = f.eyeDistance * w
      const faceW = f.faceWidth * w
      const faceH = f.faceHeight * h
      const mouthWidthPx = f.mouthWidth * w
      const rot = f.rotation

      if (glassesOn) {
        const img = overlayImages.glasses
        if (img?.complete && img.naturalWidth) {
          const gw = Math.max(eyeDistancePx * 2.25, faceW * 0.78)
          const gh = gw * (img.naturalHeight / img.naturalWidth)
          ctx.save()
          ctx.translate(eyeCenterX, eyeCenterY + faceH * 0.02)
          ctx.rotate(rot)
          ctx.drawImage(img, -gw / 2, -gh / 2, gw, gh)
          ctx.restore()
        }
      }

      if (mustacheOn) {
        const img = overlayImages.mustache
        if (img?.complete && img.naturalWidth) {
          const mx = ((f.noseTip.x + f.upperLip.x) / 2) * w
          const my = (f.upperLip.y * h) + faceH * 0.03
          const mw = Math.max(mouthWidthPx * 1.2, faceW * 0.34)
          const mh = mw * (img.naturalHeight / img.naturalWidth)
          ctx.save()
          ctx.translate(mx, my)
          ctx.rotate(rot)
          ctx.drawImage(img, -mw / 2, -mh / 2, mw, mh)
          ctx.restore()
        }
      }

      if (hatOn) {
        const img = overlayImages.hat
        if (img?.complete && img.naturalWidth) {
          const hx = f.forehead.x * w
          const hy = (f.forehead.y * h) + faceH * 0.08
          const hw = Math.max(faceW * 1.28, eyeDistancePx * 3.0)
          const hh = hw * (img.naturalHeight / img.naturalWidth)
          ctx.save()
          ctx.translate(hx, hy)
          ctx.rotate(rot)
          ctx.drawImage(img, -hw / 2, -hh * 0.72, hw, hh)
          ctx.restore()
        }
      }

      if (heartsOn) {
        const foreheadX = f.forehead.x * w
        const foreheadY = f.forehead.y * h
        const heartSize = Math.max(16, faceW * 0.14)
        ctx.save()
        ctx.textAlign = 'center'
        ctx.font = `${heartSize}px serif`
        const positions = [
          { dx: 0, dy: -faceH * 0.15 },
          { dx: -faceW * 0.18, dy: -faceH * 0.25 },
          { dx: faceW * 0.18, dy: -faceH * 0.25 },
          { dx: -faceW * 0.08, dy: -faceH * 0.35 },
          { dx: faceW * 0.08, dy: -faceH * 0.35 },
        ]
        for (const p of positions) {
          ctx.fillText('❤️', foreheadX + p.dx, foreheadY + p.dy)
        }
        ctx.restore()
      }
    }

    if (hd && beerOn) {
      const img = overlayImages.polarcita
      if (img?.complete && img.naturalWidth) {
        const px = hd.palmCenter.x * w
        const py = hd.palmCenter.y * h
        const handWidthPx = hd.handWidth * w
        const bw = Math.max(handWidthPx * 1.05, 44)
        const bh = bw * (img.naturalHeight / img.naturalWidth)
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(hd.rotation - Math.PI / 2)
        ctx.drawImage(img, -bw / 2, -bh * 0.68, bw, bh)
        ctx.restore()
      }
    }
  }, [glassesOn, mustacheOn, hatOn, heartsOn, beerOn])

  // Take photo
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
      // Mirror
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
    drawOverlays(ctx, w, h, face, hand)

    const dataUrl = canvas.toDataURL('image/png')
    setPhotos(prev => [{ id: Date.now().toString(), dataUrl }, ...prev])
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }, [hasCamera, activeFilter, face, hand, drawOverlays])

  const downloadPhoto = (dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `photo_${Date.now()}.png`
    a.click()
  }

  const cycleSample = () => setSampleIndex(prev => (prev + 1) % SAMPLE_IMAGES.length)
  const filterStyle = FILTERS[activeFilter].css

  // Convert face/hand landmarks to CSS overlay positions for live preview
  const getOverlayCSS = useCallback((
    container: HTMLDivElement | null
  ) => {
    if (!container) return { glasses: null, mustache: null, hat: null, hearts: [] as React.CSSProperties[], beer: null }
    const cw = container.clientWidth
    const ch = container.clientHeight

    let glasses: React.CSSProperties | null = null
    let mustache: React.CSSProperties | null = null
    let hat: React.CSSProperties | null = null
    let hearts: React.CSSProperties[] = []
    let beer: React.CSSProperties | null = null

    if (face) {
      const eyeCenterX = ((face.leftEye.x + face.rightEye.x) / 2) * cw
      const eyeCenterY = ((face.leftEye.y + face.rightEye.y) / 2) * ch
      const eyeDistancePx = face.eyeDistance * cw
      const faceW = face.faceWidth * cw
      const faceH = face.faceHeight * ch
      const mouthWidthPx = face.mouthWidth * cw
      const rotDeg = (face.rotation * 180) / Math.PI

      if (glassesOn) {
        const gw = Math.max(eyeDistancePx * 2.25, faceW * 0.78)
        const gh = gw * 0.35
        glasses = {
          position: 'absolute',
          left: eyeCenterX - gw / 2,
          top: (eyeCenterY + faceH * 0.02) - gh / 2,
          width: gw,
          height: gh,
          transform: `rotate(${rotDeg}deg)`,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
        }
      }

      if (mustacheOn) {
        const mx = ((face.noseTip.x + face.upperLip.x) / 2) * cw
        const my = (face.upperLip.y * ch) + faceH * 0.03
        const mw = Math.max(mouthWidthPx * 1.2, faceW * 0.34)
        const mh = mw * 0.35
        mustache = {
          position: 'absolute',
          left: mx - mw / 2,
          top: my - mh / 2,
          width: mw,
          height: mh,
          transform: `rotate(${rotDeg}deg)`,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
        }
      }

      if (hatOn) {
        const hx = face.forehead.x * cw
        const hy = (face.forehead.y * ch) + faceH * 0.08
        const hw = Math.max(faceW * 1.28, eyeDistancePx * 3.0)
        const hh = hw * 0.75
        hat = {
          position: 'absolute',
          left: hx - hw / 2,
          top: hy - hh * 0.72,
          width: hw,
          height: hh,
          transform: `rotate(${rotDeg}deg) scaleX(-1)`,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
        }
      }

      if (heartsOn) {
        const foreheadX = face.forehead.x * cw
        const foreheadY = face.forehead.y * ch
        const positions = [
          { dx: 0, dy: -faceH * 0.15, size: faceW * 0.14 },
          { dx: -faceW * 0.18, dy: -faceH * 0.25, size: faceW * 0.12 },
          { dx: faceW * 0.18, dy: -faceH * 0.25, size: faceW * 0.12 },
          { dx: -faceW * 0.08, dy: -faceH * 0.35, size: faceW * 0.1 },
          { dx: faceW * 0.08, dy: -faceH * 0.35, size: faceW * 0.1 },
        ]
        hearts = positions.map(p => ({
          position: 'absolute' as const,
          left: foreheadX + p.dx - p.size / 2,
          top: foreheadY + p.dy - p.size / 2,
          fontSize: p.size,
          pointerEvents: 'none' as const,
          zIndex: 10,
          filter: 'drop-shadow(0 2px 4px rgba(255,0,0,0.4))',
        }))
      }
    }

    if (hand && beerOn) {
      const px = hand.palmCenter.x * cw
      const py = hand.palmCenter.y * ch
      const bh = Math.max(hand.handHeight * ch * 1.1, hand.handSize * ch * 1.05)
      const bw = bh * 0.35
      const rotDeg = ((hand.rotation - Math.PI / 2) * 180) / Math.PI
      beer = {
        position: 'absolute',
        left: px - bw / 2,
        top: py - bh * 0.62,
        width: bw,
        height: bh,
        transform: `rotate(${rotDeg}deg)`,
        pointerEvents: 'none',
        zIndex: 10,
        objectFit: 'contain',
      }
    }

    return { glasses, mustache, hat, hearts, beer }
  }, [face, hand, glassesOn, mustacheOn, hatOn, heartsOn, beerOn])

  const overlays = getOverlayCSS(viewfinderRef.current)

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

        {/* Loading indicator */}
        {hasCamera && anyOverlay && !trackingReady && (
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)', color: '#8cf', padding: '4px 12px',
            borderRadius: 4, fontSize: 10, fontFamily: 'Tahoma, sans-serif', zIndex: 20,
          }}>
            Loading face tracking...
          </div>
        )}

        {/* Live overlays */}
        {overlays.glasses && <img src={OVERLAY_PATHS.glasses} alt="" style={overlays.glasses} />}
        {overlays.mustache && <img src={OVERLAY_PATHS.mustache} alt="" style={overlays.mustache} />}
        {overlays.hat && <img src={OVERLAY_PATHS.hat} alt="" style={overlays.hat} />}
        {overlays.beer && <img src={OVERLAY_PATHS.polarcita} alt="" style={overlays.beer} />}

        {overlays.hearts.map((style, i) => (
          <div key={i} style={style}>❤️</div>
        ))}

        {/* Centered fallbacks when no face detected */}
        {hasCamera && glassesOn && !face && trackingReady && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <img src={OVERLAY_PATHS.glasses} alt="" style={{ width: '40%' }} />
          </div>
        )}
        {hasCamera && heartsOn && !face && trackingReady && (
          <div style={{
            position: 'absolute', top: '10%', left: 0, right: 0,
            pointerEvents: 'none', display: 'flex', justifyContent: 'center', gap: 14, zIndex: 10, opacity: 0.5
          }}>
            <span style={{ fontSize: 34 }}>❤️</span>
            <span style={{ fontSize: 28, transform: 'translateY(8px)' }}>❤️</span>
            <span style={{ fontSize: 34 }}>❤️</span>
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
        <button className={`camera-btn ${heartsOn ? 'active' : ''}`} onClick={() => setHeartsOn(!heartsOn)}>
          <Heart size={18} fill={heartsOn ? '#ff4466' : 'none'} />
        </button>
        <button className={`camera-btn ${hatOn ? 'active' : ''}`} onClick={() => setHatOn(!hatOn)} title="Hat">
          <Crown size={18} color={hatOn ? '#ff4466' : undefined} />
        </button>
        <button className="camera-btn camera-shutter" onClick={takePhoto}>
          <div className="shutter-circle" />
        </button>
        <button className={`camera-btn ${glassesOn ? 'active' : ''}`} onClick={() => setGlassesOn(!glassesOn)} title="Glasses">
          <Glasses size={18} color={glassesOn ? '#ffcc00' : undefined} />
        </button>
        <button className={`camera-btn ${mustacheOn ? 'active' : ''}`} onClick={() => setMustacheOn(!mustacheOn)} title="Mustache">
          <Smile size={18} color={mustacheOn ? '#ffcc00' : undefined} />
        </button>
        <button className={`camera-btn ${beerOn ? 'active' : ''}`} onClick={() => setBeerOn(!beerOn)} title="Polarcita">
          <Beer size={18} color={beerOn ? '#f0a030' : undefined} />
        </button>
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="camera-gallery">
          {photos.map(photo => (
            <div key={photo.id} className="camera-thumb" onClick={() => setViewPhoto(photo.dataUrl)}>
              <img src={photo.dataUrl} alt="Captured" />
              <div className="thumb-actions">
                <button onClick={e => { e.stopPropagation(); downloadPhoto(photo.dataUrl) }}><Download size={10} /></button>
                <button onClick={e => { e.stopPropagation(); setPhotos(p => p.filter(pp => pp.id !== photo.id)) }}><Trash2 size={10} /></button>
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
