import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX
} from 'lucide-react'

interface YTTrack {
  id: string
  title: string
  artist: string
  duration: number // seconds
  youtubeId: string
}

const playlistTracks: YTTrack[] = [
  { id: '1', title: 'Atlantis', artist: 'Bridgit Mendler ft. Kaiydo', duration: 237, youtubeId: 'JK8VoVqLXeY' },
  { id: '2', title: "Where's My Love", artist: 'SYML', duration: 253, youtubeId: 'goWa6EzkCh4' },
  { id: '3', title: 'Call the Days', artist: 'Nadia Reid', duration: 213, youtubeId: 'y_Yt-_DS3bI' },
  { id: '4', title: 'All The Pretty Girls', artist: 'KALEO', duration: 272, youtubeId: 'FNwgOkl5nRY' },
  { id: '5', title: 'Georgia', artist: 'Vance Joy', duration: 239, youtubeId: 'DQMbHNofCzw' },
  { id: '6', title: 'Ophelia', artist: 'The Lumineers', duration: 163, youtubeId: 'pTOC_q0NLTk' },
  { id: '7', title: 'Sunday Morning', artist: 'Maroon 5', duration: 265, youtubeId: 'S2Cti12XBw4' },
  { id: '8', title: 'Morning Rain', artist: 'Adam Torres', duration: 300, youtubeId: 'qlG_NCpld8g' },
  { id: '9', title: 'Amadeus', artist: 'JoJo Worthington', duration: 229, youtubeId: 'OOP3jQWxU6o' },
  { id: '10', title: 'The Words You Say', artist: 'Harrison Storm', duration: 211, youtubeId: 'kiaFCCElq-w' },
]

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MusicPlayer() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [eqBars, setEqBars] = useState<number[]>(Array(24).fill(5))
  const [playerReady, setPlayerReady] = useState(false)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval>>()

  const currentTrack = playlistTracks[currentTrackIdx]

  // Animate EQ bars
  useEffect(() => {
    if (!isPlaying) {
      setEqBars(Array(24).fill(5))
      return
    }
    const interval = setInterval(() => {
      setEqBars(prev => prev.map(() => 10 + Math.random() * 90))
    }, 80)
    return () => clearInterval(interval)
  }, [isPlaying])

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
    
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (!existing) {
      document.head.appendChild(tag)
    }

    const initPlayer = () => {
      if (!containerRef.current) return
      // Create a div for the player
      const playerDiv = document.createElement('div')
      playerDiv.id = 'wmp-yt-player-' + Date.now()
      containerRef.current.appendChild(playerDiv)

      playerRef.current = new (window as any).YT.Player(playerDiv.id, {
        height: '1',
        width: '1',
        videoId: playlistTracks[0].youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
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
              handleNext()
            }
          },
        },
      })
    }

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer()
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      try { playerRef.current?.destroy?.() } catch {}
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

  const handleTrackSelect = useCallback((idx: number) => {
    setCurrentTrackIdx(idx)
    setPosition(0)
    if (playerRef.current && playerReady) {
      playerRef.current.loadVideoById(playlistTracks[idx].youtubeId)
    }
  }, [playerReady])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNext = useCallback(() => {
    const nextIdx = (currentTrackIdx + 1) % playlistTracks.length
    handleTrackSelect(nextIdx)
  }, [currentTrackIdx, handleTrackSelect])

  const handlePrev = useCallback(() => {
    const prevIdx = (currentTrackIdx - 1 + playlistTracks.length) % playlistTracks.length
    handleTrackSelect(prevIdx)
  }, [currentTrackIdx, handleTrackSelect])

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
    <div className="wmp-xp-container">
      {/* Hidden YouTube player */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* WMP Menu Bar */}
      <div className="wmp-xp-menubar">
        <button className="wmp-xp-menu-item">File</button>
        <button className="wmp-xp-menu-item">Edit</button>
        <button className="wmp-xp-menu-item">View</button>
        <button className="wmp-xp-menu-item">Help</button>
      </div>

      {/* Visualization Area */}
      <div className="wmp-xp-visualization">
        <div className="wmp-xp-eq-container">
          {eqBars.map((h, i) => (
            <div
              key={i}
              className="wmp-xp-eq-bar"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="wmp-xp-viz-progress">
          <div
            className="wmp-xp-viz-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Track Info */}
      <div className="wmp-xp-trackinfo">
        <div className="wmp-xp-track-title">{currentTrack.title}</div>
        <div className="wmp-xp-track-artist">{currentTrack.artist}</div>
      </div>

      {/* Progress / Seek Bar */}
      <div className="wmp-xp-progress-row">
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
      <div className="wmp-xp-controls">
        <button className="wmp-xp-ctrl-btn" title="Shuffle">
          <Shuffle size={12} />
        </button>
        <button className="wmp-xp-ctrl-btn" onClick={handlePrev} title="Previous">
          <SkipBack size={14} fill="currentColor" />
        </button>
        <button className="wmp-xp-play-btn" onClick={handlePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying
            ? <Pause size={18} fill="currentColor" />
            : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
          }
        </button>
        <button className="wmp-xp-ctrl-btn" onClick={handleNext} title="Next">
          <SkipForward size={14} fill="currentColor" />
        </button>
        <button className="wmp-xp-ctrl-btn" title="Repeat">
          <Repeat size={12} />
        </button>

        <div className="wmp-xp-volume">
          <button className="wmp-xp-vol-icon" onClick={() => setIsMuted(!isMuted)}>
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

      {/* Playlist */}
      <div className="wmp-xp-playlist">
        {playlistTracks.map((track, idx) => (
          <div
            key={track.id}
            className={`wmp-xp-playlist-row ${idx === currentTrackIdx ? 'active' : ''}`}
            onClick={() => handleTrackSelect(idx)}
          >
            <span className="wmp-xp-pl-name">
              {track.title} - {track.artist}
            </span>
            <span className="wmp-xp-pl-duration">{formatTime(track.duration)}</span>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="wmp-xp-statusbar">
        Windows Media Player
      </div>
    </div>
  )
}
