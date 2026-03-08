import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2
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

  // Track progress
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

  // Load YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    )
    if (!existing) {
      document.head.appendChild(tag)
    }

    const initPlayer = () => {
      if (!containerRef.current) return
      const playerDiv = document.createElement('div')
      playerDiv.id = 'wmp-video-player-' + Date.now()
      containerRef.current.appendChild(playerDiv)

      playerRef.current = new (window as any).YT.Player(playerDiv.id, {
        height: '100%',
        width: '100%',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          showinfo: 0
        },
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

    return () => {
      try {
        playerRef.current?.destroy?.()
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Volume sync
  useEffect(() => {
    if (playerRef.current && playerReady) {
      if (isMuted) {
        playerRef.current.mute()
      } else {
        playerRef.current.unMute()
        playerRef.current.setVolume(volume)
      }
    }
  }, [volume, isMuted, playerReady])

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReady) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [isPlaying, playerReady])

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
      {/* WMP Menu Bar */}
      <div className="wmp-xp-menubar">
        <button className="wmp-xp-menu-item">File</button>
        <button className="wmp-xp-menu-item">View</button>
        <button className="wmp-xp-menu-item">Play</button>
        <button className="wmp-xp-menu-item">Tools</button>
        <button className="wmp-xp-menu-item">Help</button>
      </div>

      {/* Video Area */}
      <div className="wmp-video-area" ref={containerRef} />

      {/* Status */}
      <div className="wmp-video-statusbar">
        <span style={{ opacity: 0.7, fontSize: '10px' }}>Ready</span>
      </div>

      {/* Progress / Seek Bar */}
      <div className="wmp-xp-progress-row" style={{ padding: '2px 8px' }}>
        <span className="wmp-xp-time">{formatTime(position)}</span>
        <div className="wmp-xp-progress-track" onClick={handleSeek}>
          <div
            className="wmp-xp-progress-thumb"
            style={{ left: `${progressPct}%` }}
          />
          <div
            className="wmp-xp-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="wmp-xp-time">{formatTime(duration)}</span>
      </div>

      {/* Playback Controls */}
      <div className="wmp-xp-controls" style={{ padding: '4px 8px 6px' }}>
        <button
          className="wmp-xp-ctrl-btn"
          onClick={() => {
            if (playerRef.current && playerReady) {
              const t = Math.max(0, position - 10)
              playerRef.current.seekTo(t, true)
              setPosition(t)
            }
          }}
          title="Rewind"
        >
          <SkipBack size={14} fill="currentColor" />
        </button>
        <button
          className="wmp-xp-play-btn"
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play
              size={18}
              fill="currentColor"
              style={{ marginLeft: '2px' }}
            />
          )}
        </button>
        <button
          className="wmp-xp-ctrl-btn"
          onClick={() => {
            if (playerRef.current && playerReady) {
              const t = Math.min(duration, position + 10)
              playerRef.current.seekTo(t, true)
              setPosition(t)
            }
          }}
          title="Fast Forward"
        >
          <SkipForward size={14} fill="currentColor" />
        </button>

        <div className="wmp-xp-volume">
          <button
            className="wmp-xp-vol-icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <input
            type="range"
            className="wmp-xp-vol-slider"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value))
              setIsMuted(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}
