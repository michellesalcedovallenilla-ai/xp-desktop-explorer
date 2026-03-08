import { useRef, useEffect, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useSystemStore } from '../../store/useSystemStore'
import DraggableWidget from './DraggableWidget'

export default function MusicPlayerWidget() {
  const { playlist, currentTrack, isPlaying, setCurrentTrack, setIsPlaying } =
    useSystemStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPlaying || !currentTrack) return
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIsPlaying(false)
          return 0
        }
        return p + 100 / currentTrack.duration
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying, currentTrack, setIsPlaying])

  const handlePlay = () => {
    if (!currentTrack && playlist.length > 0) {
      setCurrentTrack(playlist[0])
    }
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (!currentTrack || playlist.length === 0) return
    const idx = playlist.findIndex((t) => t.id === currentTrack.id)
    const next = playlist[(idx + 1) % playlist.length]
    setCurrentTrack(next)
    setProgress(0)
  }

  const handlePrev = () => {
    if (!currentTrack || playlist.length === 0) return
    const idx = playlist.findIndex((t) => t.id === currentTrack.id)
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length]
    setCurrentTrack(prev)
    setProgress(0)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <DraggableWidget
      id="music"
      title="Windows Media Player"
      className="xp-music-widget"
    >
      <div className="xp-wmp-body">
        {/* Visualization area */}
        <div className="xp-wmp-visual">
          <div className="xp-wmp-eq">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="xp-wmp-eq-bar"
                style={{
                  height: isPlaying ? `${20 + Math.random() * 80}%` : '20%',
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Track info */}
        {currentTrack && (
          <div className="xp-wmp-track-info">
            <span className="xp-wmp-title">{currentTrack.title}</span>
            <span className="xp-wmp-artist">{currentTrack.artist}</span>
          </div>
        )}

        {/* Progress */}
        <div className="xp-wmp-progress-row">
          <span className="xp-wmp-time">
            {formatTime(
              currentTrack ? (progress / 100) * currentTrack.duration : 0
            )}
          </span>
          <div className="xp-wmp-progress-track">
            <div
              className="xp-wmp-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="xp-wmp-time">
            {currentTrack ? formatTime(currentTrack.duration) : '0:00'}
          </span>
        </div>

        {/* Controls */}
        <div className="xp-wmp-controls">
          <button className="xp-wmp-ctrl" onClick={handlePrev} title="Previous">
            <SkipBack size={14} />
          </button>
          <button
            className="xp-wmp-ctrl xp-wmp-play"
            onClick={handlePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="xp-wmp-ctrl" onClick={handleNext} title="Next">
            <SkipForward size={14} />
          </button>
          <div className="xp-wmp-vol">
            <Volume2 size={12} />
            <input
              type="range"
              className="xp-wmp-vol-slider"
              min="0"
              max="100"
              defaultValue="75"
            />
          </div>
        </div>

        {/* Playlist */}
        <div className="xp-wmp-playlist">
          {playlist.map((track) => (
            <button
              key={track.id}
              className={`xp-wmp-playlist-item ${currentTrack?.id === track.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentTrack(track)
                setProgress(0)
              }}
            >
              <span>{track.title}</span>
              <span className="xp-wmp-pl-artist">{track.artist}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden YouTube iframe */}
      {currentTrack && isPlaying && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&controls=0`}
          style={{ display: 'none' }}
          allow="autoplay"
          title="Music Player"
        />
      )}
    </DraggableWidget>
  )
}
