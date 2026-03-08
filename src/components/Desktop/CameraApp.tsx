import { useEffect, useRef, useState, useCallback } from 'react'
import { Download, Trash2, X, Crown, Smile } from 'lucide-react'
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
  const [mustacheOn, setMustacheOn] = useState(false)
  const [hatOn, setHatOn] = useState(false)
  const [beerOn, setBeerOn] = useState(false)

  const anyOverlay = mustacheOn || hatOn || beerOn

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

  // Draw overlays on a canvas context using normalized landmarks mapped to this canvas space
  const drawOverlays = useCallback((
    ctx: CanvasRenderingContext2D,
    w: number, h: number,
    f: FaceLandmarks | null,
    hd: HandPosition | null
  ) => {
    const toPx = (p: { x: number; y: number }) => ({ x: p.x * w, y: p.y * h })
    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
    const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    })

    if (f) {
      const leftEye = toPx(f.leftEye)
      const rightEye = toPx(f.rightEye)
      const noseTip = toPx(f.noseTip)
      const upperLip = toPx(f.upperLip)
      const mouthLeft = toPx(f.mouthLeft)
      const mouthRight = toPx(f.mouthRight)
      const forehead = toPx(f.forehead)
      const chin = toPx(f.chin)
      const leftTemple = toPx(f.leftTemple)
      const rightTemple = toPx(f.rightTemple)

      const eyeDistancePx = dist(leftEye, rightEye)
      const mouthWidthPx = dist(mouthLeft, mouthRight)
      const faceHeightPx = dist(forehead, chin)
      const faceWidthPx = dist(leftTemple, rightTemple)
      const rotation = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x)

      if (mustacheOn) {
        const img = overlayImages.mustache
        if (img?.complete && img.naturalWidth) {
          const anchor = lerp(noseTip, upperLip, 0.68)
          const mw = Math.max(mouthWidthPx * 1.45, faceWidthPx * 0.4)
          const mh = mw * (img.naturalHeight / img.naturalWidth)
          ctx.save()
          ctx.translate(anchor.x, anchor.y + faceHeightPx * 0.02)
          ctx.rotate(rotation)
          ctx.scale(-1, -1)
          ctx.drawImage(img, -mw / 2, -mh / 2, mw, mh)
          ctx.restore()
        }
      }

      if (hatOn) {
        const img = overlayImages.hat
        if (img?.complete && img.naturalWidth) {
          const hw = Math.max(faceWidthPx * 1.05, eyeDistancePx * 2.4)
          const hh = hw * (img.naturalHeight / img.naturalWidth)
          const hatAnchor = { x: forehead.x, y: forehead.y - faceHeightPx * 0.18 }
          ctx.save()
          ctx.translate(hatAnchor.x, hatAnchor.y)
          ctx.rotate(rotation)
          ctx.scale(-1, -1)
          ctx.drawImage(img, -hw / 2, -hh * 0.62, hw, hh)
          ctx.restore()
        }
      }

      if (heartsOn) {
        const heartSize = Math.max(16, faceWidthPx * 0.14)
        ctx.save()
        ctx.textAlign = 'center'
        ctx.font = `${heartSize}px serif`
        const positions = [
          { dx: 0, dy: -faceHeightPx * 0.25 },
          { dx: -faceWidthPx * 0.18, dy: -faceHeightPx * 0.35 },
          { dx: faceWidthPx * 0.18, dy: -faceHeightPx * 0.35 },
          { dx: -faceWidthPx * 0.08, dy: -faceHeightPx * 0.45 },
          { dx: faceWidthPx * 0.08, dy: -faceHeightPx * 0.45 },
        ]
        for (const p of positions) {
          ctx.fillText('❤️', forehead.x + p.dx, forehead.y + p.dy)
        }
        ctx.restore()
      }
    }

    if (hd && beerOn) {
      const img = overlayImages.polarcita
      if (img?.complete && img.naturalWidth) {
        const palm = toPx(hd.palmCenter)
        const handWidthPx = hd.handWidth * w
        const bw = Math.max(handWidthPx * 2.0, 75)
        const bh = bw * (img.naturalHeight / img.naturalWidth)
        ctx.save()
        ctx.translate(palm.x, palm.y)
        ctx.rotate(hd.rotation + Math.PI / 2)
        ctx.drawImage(img, -bw / 2, -bh * 0.56, bw, bh)
        ctx.restore()
      }
    }
  }, [mustacheOn, hatOn, heartsOn, beerOn])

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
  const liveFilterStyle = FILTERS[activeFilter].css
  const filterStyle = FILTERS[activeFilter].css

  // Convert normalized landmark coordinates to displayed (object-fit: cover) viewport coordinates
  const mapToViewfinder = useCallback((x: number, y: number, container: HTMLDivElement | null) => {
    if (!container || !videoRef.current) return { x: 0, y: 0 }
    const cw = container.clientWidth
    const ch = container.clientHeight
    const vw = videoRef.current.videoWidth || cw
    const vh = videoRef.current.videoHeight || ch
    const scale = Math.max(cw / vw, ch / vh)
    const dw = vw * scale
    const dh = vh * scale
    const offsetX = (cw - dw) / 2
    const offsetY = (ch - dh) / 2
    return {
      x: x * dw + offsetX,
      y: y * dh + offsetY,
    }
  }, [])

  // Convert face/hand landmarks to CSS overlay positions for live preview
  const getOverlayCSS = useCallback((
    container: HTMLDivElement | null
  ) => {
    if (!container) return { mustache: null, hat: null, hearts: [] as React.CSSProperties[], beer: null }

    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
    const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    })

    let mustache: React.CSSProperties | null = null
    let hat: React.CSSProperties | null = null
    let hearts: React.CSSProperties[] = []
    let beer: React.CSSProperties | null = null

    if (face) {
      const leftEye = mapToViewfinder(face.leftEye.x, face.leftEye.y, container)
      const rightEye = mapToViewfinder(face.rightEye.x, face.rightEye.y, container)
      const forehead = mapToViewfinder(face.forehead.x, face.forehead.y, container)
      const chin = mapToViewfinder(face.chin.x, face.chin.y, container)
      const leftTemple = mapToViewfinder(face.leftTemple.x, face.leftTemple.y, container)
      const rightTemple = mapToViewfinder(face.rightTemple.x, face.rightTemple.y, container)
      const upperLip = mapToViewfinder(face.upperLip.x, face.upperLip.y, container)
      const noseTip = mapToViewfinder(face.noseTip.x, face.noseTip.y, container)
      const mouthLeft = mapToViewfinder(face.mouthLeft.x, face.mouthLeft.y, container)
      const mouthRight = mapToViewfinder(face.mouthRight.x, face.mouthRight.y, container)

      const eyeDistancePx = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y)
      const faceWidthPx = dist(leftTemple, rightTemple)
      const faceHeightPx = dist(forehead, chin)
      const mouthWidthPx = dist(mouthLeft, mouthRight)
      const rotation = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x)
      const rotDeg = (rotation * 180) / Math.PI

      if (mustacheOn) {
        const mustacheImg = overlayImages.mustache
        const anchor = lerp(noseTip, upperLip, 0.68)
        const mw = Math.max(mouthWidthPx * 1.45, faceWidthPx * 0.4)
        const mhRatio = mustacheImg?.naturalWidth ? (mustacheImg.naturalHeight / mustacheImg.naturalWidth) : 0.35
        const mh = mw * mhRatio
        mustache = {
          position: 'absolute',
          left: anchor.x - mw / 2,
          top: (anchor.y + faceHeightPx * 0.02) - mh / 2,
          width: mw,
          height: mh,
          transform: `rotate(${rotDeg}deg) scale(-1, -1)`,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
        }
      }

      if (hatOn) {
        const hatImg = overlayImages.hat
        const hw = Math.max(faceWidthPx * 1.05, eyeDistancePx * 2.4)
        const hhRatio = hatImg?.naturalWidth ? (hatImg.naturalHeight / hatImg.naturalWidth) : 0.75
        const hh = hw * hhRatio
        const hatAnchor = { x: forehead.x, y: forehead.y - faceHeightPx * 0.18 }
        hat = {
          position: 'absolute',
          left: hatAnchor.x - hw / 2,
          top: hatAnchor.y - hh * 0.62,
          width: hw,
          height: hh,
          transform: `rotate(${rotDeg}deg) scale(-1, -1)`,
          pointerEvents: 'none',
          zIndex: 10,
          objectFit: 'contain',
        }
      }

      if (heartsOn) {
        const positions = [
          { dx: 0, dy: -faceHeightPx * 0.25, size: faceWidthPx * 0.14 },
          { dx: -faceWidthPx * 0.18, dy: -faceHeightPx * 0.35, size: faceWidthPx * 0.12 },
          { dx: faceWidthPx * 0.18, dy: -faceHeightPx * 0.35, size: faceWidthPx * 0.12 },
          { dx: -faceWidthPx * 0.08, dy: -faceHeightPx * 0.45, size: faceWidthPx * 0.1 },
          { dx: faceWidthPx * 0.08, dy: -faceHeightPx * 0.45, size: faceWidthPx * 0.1 },
        ]
        hearts = positions.map(p => ({
          position: 'absolute' as const,
          left: forehead.x + p.dx - p.size / 2,
          top: forehead.y + p.dy - p.size / 2,
          fontSize: p.size,
          pointerEvents: 'none' as const,
          zIndex: 10,
          filter: 'drop-shadow(0 2px 4px rgba(255,0,0,0.4))',
        }))
      }
    }

    if (hand && beerOn) {
      const beerImg = overlayImages.polarcita
      const palm = mapToViewfinder(hand.palmCenter.x, hand.palmCenter.y, container)
      const indexMcp = mapToViewfinder(hand.palmCenter.x - hand.handWidth / 2, hand.palmCenter.y, container)
      const pinkyMcp = mapToViewfinder(hand.palmCenter.x + hand.handWidth / 2, hand.palmCenter.y, container)
      const handWidthPx = dist(indexMcp, pinkyMcp)
      const bw = Math.max(handWidthPx * 2.0, 50)
      const bhRatio = beerImg?.naturalWidth ? (beerImg.naturalHeight / beerImg.naturalWidth) : (1 / 0.35)
      const bh = bw * bhRatio
      const rotDeg = ((hand.rotation + Math.PI / 2) * 180) / Math.PI
      beer = {
        position: 'absolute',
        left: palm.x - bw / 2,
        top: palm.y - bh * 0.56,
        width: bw,
        height: bh,
        transform: `rotate(${rotDeg}deg)`,
        pointerEvents: 'none',
        zIndex: 10,
        objectFit: 'contain',
      }
    }

    return { mustache, hat, hearts, beer }
  }, [face, hand, mustacheOn, hatOn, heartsOn, beerOn])

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
            style={{ filter: liveFilterStyle }}
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
        {overlays.mustache && <img src={OVERLAY_PATHS.mustache} alt="" style={overlays.mustache} />}
        {overlays.hat && <img src={OVERLAY_PATHS.hat} alt="" style={overlays.hat} />}
        {overlays.beer && <img src={OVERLAY_PATHS.polarcita} alt="" style={overlays.beer} />}

        {overlays.hearts.map((style, i) => (
          <div key={i} style={style}>❤️</div>
        ))}

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
