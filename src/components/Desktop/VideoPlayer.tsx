import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
  Monitor
} from 'lucide-react'

const YOUTUBE_VIDEO_ID = 'a_YR4dKArgo'

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    if (isPlaying && playerRef.current) {
      progressInterval.current = setInterval(() => {
        try {
          const ct = playerRef.current?.getCurrentTime?.() || 0
          const dur = playerRef.current?.getDuration?.() || 0
          setPosition(ct)
          setDuration(dur)
        } catch {}
      }, 500)
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [isPlaying])

  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (!existing) document.head.appendChild(tag)

    const initPlayer = () => {
      if (!containerRef.current) return
      const playerDiv = document.createElement('div')
      playerDiv.id = 'wmp-video-player-' + Date.now()
      containerRef.current.appendChild(playerDiv)

      playerRef.current = new (window as any).YT.Player(playerDiv.id, {
        height: '100%',
        width: '100%',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, fs: 0, iv_load_policy: 3, showinfo: 0 },
        events: {
          onReady: () => {
            setPlayerReady(true)
            playerRef.current.setVolume(volume)
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              setDuration(playerRef.current.getDuration())
            } else if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            } else if (event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false)
              setPosition(0)
            }
          }
        }
      })
    }

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer()
    } else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady
      ;(window as any).onYouTubeIframeAPIReady = () => {
        prevCallback?.()
        initPlayer()
      }
    }
    return () => { try { playerRef.current?.destroy?.() } catch {} }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (playerRef.current && playerReady) {
      if (isMuted) { playerRef.current.mute() }
      else { playerRef.current.unMute(); playerRef.current.setVolume(volume) }
    }
  }, [volume, isMuted, playerReady])

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReady) return
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }, [isPlaying, playerReady])

  const handleStop = useCallback(() => {
    if (!playerRef.current || !playerReady) return
    playerRef.current.stopVideo()
    setIsPlaying(false)
    setPosition(0)
  }, [playerReady])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !playerRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const seekSec = pct * duration
    playerRef.current.seekTo(seekSec, true)
    setPosition(seekSec)
  }

  const progressPct = duration > 0 ? (position / duration) * 100 : 0

  return (
    <div className="wmp-video-container">
      {/* Cream menu bar */}
      <div className="wmp-video-menubar">
        <button>File</button>
        <button>View</button>
        <button>Play</button>
        <button>Tools</button>
        <button>Help</button>
      </div>

      {/* Toolbar strip */}
      <div className="wmp-video-toolbar">
        <div className="wmp-video-toolbar-progress" />
        <div className="wmp-video-toolbar-icons">
          <button title="Now Playing"><Monitor size={12} /></button>
        </div>
      </div>

      {/* Video Area */}
      <div className="wmp-video-area" ref={containerRef} />

      {/* Status bar */}
      <div className="wmp-video-statusbar">Ready</div>

      {/* Dark blue bottom control bar */}
      <div className="wmp-video-controlbar">
        {/* Progress */}
        <div className="wmp-video-progress-row">
          <span className="wmp-video-time">{formatTime(position)}</span>
          <div className="wmp-video-progress-track" onClick={handleSeek}>
            <div className="wmp-video-progress-thumb" style={{ left: `${progressPct}%` }} />
            <div className="wmp-video-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="wmp-video-time">{formatTime(duration)}</span>
        </div>

        {/* Round buttons */}
        <div className="wmp-video-controls-row">
          <button className="wmp-video-ctrl-btn" onClick={() => {
            if (playerRef.current && playerReady) {
              playerRef.current.seekTo(Math.max(0, position - 10), true)
            }
          }} title="Rewind">
            <SkipBack size={12} fill="currentColor" />
          </button>

          <button className="wmp-video-play-btn" onClick={handlePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying
              ? <Pause size={18} fill="currentColor" />
              : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
            }
          </button>

          <button className="wmp-video-stop-btn" onClick={handleStop} title="Stop">
            <Square size={10} fill="currentColor" />
          </button>

          <button className="wmp-video-ctrl-btn" onClick={() => {
            if (playerRef.current && playerReady) {
              playerRef.current.seekTo(Math.min(duration, position + 10), true)
            }
          }} title="Fast Forward">
            <SkipForward size={12} fill="currentColor" />
          </button>

          <div className="wmp-video-volume">
            <button className="wmp-video-vol-icon" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <input
              type="range"
              className="wmp-video-vol-slider"
              min="0" max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
