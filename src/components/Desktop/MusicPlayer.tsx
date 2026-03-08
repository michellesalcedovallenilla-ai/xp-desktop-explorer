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

// Spotify playlist tracks with their URIs
const SPOTIFY_PLAYLIST_URI = 'spotify:playlist:3x3dxHjNbb62D1qYrNHcqv'

interface SpotifyTrack {
  id: string
  title: string
  artist: string
  duration: number
  uri: string
}

const playlistTracks: SpotifyTrack[] = [
  { id: '1', title: 'Rush', artist: 'Troye Sivan', duration: 195, uri: 'spotify:track:4ZnkygoWIzmMiSJPOuJgcl' },
  { id: '2', title: 'One of Your Girls', artist: 'Troye Sivan', duration: 195, uri: 'spotify:track:6761sGRbhCFCclVpKmRmBj' },
  { id: '3', title: 'Got Me Started', artist: 'Troye Sivan', duration: 188, uri: 'spotify:track:4oLxLPpiMpKOrdGrsLYqbN' },
  { id: '4', title: '360', artist: 'Charli XCX', duration: 173, uri: 'spotify:track:2HIpMRyLBxnY8OxbhKVKlG' },
  { id: '5', title: 'Apple', artist: 'Charli XCX', duration: 180, uri: 'spotify:track:5TDyIerGJmBDorBqKEz5Gs' },
]

const formatTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
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
  const controllerRef = useRef<any>(null)
  const embedRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>()

  const currentTrack = playlistTracks[currentTrackIdx]

  // Animate EQ bars
  useEffect(() => {
    if (!isPlaying) {
      setEqBars(Array(24).fill(5))
      return
    }
    const animate = () => {
      setEqBars(prev => prev.map(() => 10 + Math.random() * 90))
      animFrameRef.current = requestAnimationFrame(animate)
    }
    // Throttle to ~15fps for performance
    const interval = setInterval(() => {
      setEqBars(prev => prev.map(() => 10 + Math.random() * 90))
    }, 80)
    return () => {
      clearInterval(interval)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying])

  // Load Spotify IFrame API
  useEffect(() => {
    if (!embedRef.current) return

    // Create the iframe element for Spotify
    const existingScript = document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')
    
    const initEmbed = () => {
      if (!(window as any).SpotifyIframeApi) return
      const IFrameAPI = (window as any).SpotifyIframeApi
      
      const element = embedRef.current
      if (!element) return

      const options = {
        width: '100%',
        height: '80',
        uri: SPOTIFY_PLAYLIST_URI,
      }

      IFrameAPI.createController(element, options, (controller: any) => {
        controllerRef.current = controller
        
        controller.addListener('playback_update', (e: any) => {
          const data = e.data
          setPosition(data.position || 0)
          setDuration(data.duration || 0)
          setIsPlaying(!data.isPaused)
        })

        controller.addListener('ready', () => {
          console.log('Spotify embed ready')
        })
      })
    }

    if (existingScript) {
      // API already loaded
      if ((window as any).SpotifyIframeApi) {
        initEmbed()
      } else {
        (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
          (window as any).SpotifyIframeApi = IFrameAPI
          initEmbed()
        }
      }
    } else {
      (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
        (window as any).SpotifyIframeApi = IFrameAPI
        initEmbed()
      }
      const script = document.createElement('script')
      script.src = 'https://open.spotify.com/embed/iframe-api/v1'
      script.async = true
      document.body.appendChild(script)
    }

    return () => {
      if (controllerRef.current) {
        try { controllerRef.current.destroy() } catch {}
        controllerRef.current = null
      }
    }
  }, [])

  const handlePlayPause = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.togglePlay()
    }
  }, [])

  const handleTrackSelect = useCallback((idx: number) => {
    setCurrentTrackIdx(idx)
    const track = playlistTracks[idx]
    if (controllerRef.current) {
      controllerRef.current.loadUri(track.uri)
      controllerRef.current.play()
    }
    setPosition(0)
  }, [])

  const handleNext = useCallback(() => {
    const nextIdx = (currentTrackIdx + 1) % playlistTracks.length
    handleTrackSelect(nextIdx)
  }, [currentTrackIdx, handleTrackSelect])

  const handlePrev = useCallback(() => {
    const prevIdx = (currentTrackIdx - 1 + playlistTracks.length) % playlistTracks.length
    handleTrackSelect(prevIdx)
  }, [currentTrackIdx, handleTrackSelect])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const seekMs = pct * duration
    if (controllerRef.current) {
      controllerRef.current.seek(seekMs / 1000)
    }
    setPosition(seekMs)
  }

  const progressPct = duration > 0 ? (position / duration) * 100 : 0

  return (
    <div className="wmp-xp-container">
      {/* Hidden Spotify embed */}
      <div
        ref={embedRef}
        style={{
          position: 'fixed',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          left: '-9999px',
          top: '-9999px',
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

        {/* Green progress line at bottom of visualization */}
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

        {/* Volume */}
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
            <span className="wmp-xp-pl-duration">
              {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
            </span>
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
