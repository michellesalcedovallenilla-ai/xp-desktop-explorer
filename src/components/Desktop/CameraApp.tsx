import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Camera, Download, Trash2, X } from 'lucide-react'

interface Photo {
  id: string
  dataUrl: string
}

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [heartsEnabled, setHeartsEnabled] = useState(false)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>(
    []
  )
  const [flash, setFlash] = useState(false)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const heartIdRef = useRef(0)

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasCamera(true)
        }
      })
      .catch(() => setHasCamera(false))

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
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      setPhotos((prev) => [{ id: Date.now().toString(), dataUrl }, ...prev])
    }
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
  }, [])

  const downloadPhoto = (dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `photo_${Date.now()}.png`
    a.click()
  }

  return (
    <div className="camera-app">
      <div className="camera-viewfinder">
        {hasCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
        ) : (
          <div
            className="camera-no-feed"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: '#000',
              color: '#fff',
              textAlign: 'center',
              padding: '20px'
            }}
          >
            <Camera size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p>Camera access required for this feature</p>
          </div>
        )}

        {/* Hearts */}
        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              className="floating-heart"
              initial={{
                x: `${heart.x}%`,
                y: `${heart.y}%`,
                opacity: 1,
                scale: 0.5
              }}
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

      {/* Controls */}
      <div className="camera-controls">
        <button
          className={`camera-btn ${heartsEnabled ? 'active' : ''}`}
          onClick={() => setHeartsEnabled(!heartsEnabled)}
        >
          <Heart size={18} fill={heartsEnabled ? '#ff4466' : 'none'} />
        </button>
        <button className="camera-btn camera-shutter" onClick={takePhoto}>
          <div className="shutter-circle" />
        </button>
        <div style={{ width: 36 }} />
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="camera-gallery">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="camera-thumb"
              onClick={() => setViewPhoto(photo.dataUrl)}
            >
              <img src={photo.dataUrl} alt="Captured" />
              <div className="thumb-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadPhoto(photo.dataUrl)
                  }}
                >
                  <Download size={10} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPhotos((p) => p.filter((pp) => pp.id !== photo.id))
                  }}
                >
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
            <button
              className="camera-fullview-close"
              onClick={() => setViewPhoto(null)}
            >
              <X size={20} />
            </button>
            <img src={viewPhoto} alt="Full view" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
