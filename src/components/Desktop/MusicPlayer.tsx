import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2
} from 'lucide-react'
import { useSystemStore } from '../../store/useSystemStore'
import { formatShortTime } from '../../lib/utils'
import type { MusicTrack } from '../../types'

export default function MusicPlayer() {
  const { playlist, currentTrack, setCurrentTrack, isPlaying, setIsPlaying } =
    useSystemStore()
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Sync isPlaying state with the actual audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.warn('Autoplay blocked:', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack, volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }

  const handleEnded = () => handleNext()

  const handlePlayPause = () => setIsPlaying(!isPlaying)

  const handleNext = () => {
    if (!currentTrack) return
    const idx = playlist.findIndex((t) => t.id === currentTrack.id)
    const next = playlist[(idx + 1) % playlist.length]
    setCurrentTrack(next)
    setIsPlaying(true)
  }

  const handlePrev = () => {
    if (!currentTrack) return
    const idx = playlist.findIndex((t) => t.id === currentTrack.id)
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length]
    setCurrentTrack(prev)
    setIsPlaying(true)
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = value
      setProgress(value)
    }
  }

  const currentSrc = (currentTrack as MusicTrack & { src?: string })?.src || ''

  return (
    <div className="xp-wmp-full">
      <audio
        ref={audioRef}
        src={currentSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      {/* WMP Visualization */}
      <div className="xp-wmp-visual-full">
        <div
          className="xp-wmp-eq"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            height: '100%',
            gap: '2px'
          }}
        >
          {[...Array(32)].map((_, i) => (
            <div
              key={i}
              className={`xp-wmp-eq-bar`}
              style={{
                flex: 1,
                backgroundColor: '#39FF14',
                height: isPlaying ? '20%' : '5%',
                minHeight: '2px',
                animation: isPlaying
                  ? `wmp-eq ${0.3 + Math.random() * 0.5}s infinite alternate ease-in-out`
                  : 'none',
                animationDelay: `${Math.random() * 0.5}s`,
                boxShadow: '0 0 5px #39FF14'
              }}
            />
          ))}
        </div>
      </div>

      {/* Now Playing */}
      <div className="xp-wmp-now-playing">
        <h3>{currentTrack?.title || 'No Track Selected'}</h3>
        <p>{currentTrack?.artist || 'Unknown Artist'}</p>
      </div>

      {/* Progress Container */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#AAA' }}>
            {formatShortTime(progress)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleProgressChange}
            style={{ flex: 1, height: '4px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', color: '#AAA' }}>
            {formatShortTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div
        className="xp-wmp-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '12px',
          background: 'linear-gradient(to bottom, #444, #222)',
          borderTop: '1px solid #555'
        }}
      >
        <button
          className="xp-wmp-ctrl"
          title="Shuffle"
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            opacity: 0.7
          }}
        >
          <Shuffle size={14} />
        </button>
        <button
          className="xp-wmp-ctrl"
          onClick={handlePrev}
          title="Previous"
          style={{
            background: '#555',
            border: '1px solid #777',
            borderRadius: '50%',
            padding: '6px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <SkipBack size={16} />
        </button>
        <button
          className="xp-wmp-play"
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
          style={{
            background: '#39FF14',
            border: 'none',
            borderRadius: '50%',
            padding: '12px',
            color: '#000',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(57, 255, 20, 0.4)'
          }}
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
          )}
        </button>
        <button
          className="xp-wmp-ctrl"
          onClick={handleNext}
          title="Next"
          style={{
            background: '#555',
            border: '1px solid #777',
            borderRadius: '50%',
            padding: '6px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <SkipForward size={16} />
        </button>
        <button
          className="xp-wmp-ctrl"
          title="Repeat"
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            opacity: 0.7
          }}
        >
          <Repeat size={14} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto'
          }}
        >
          <Volume2 size={14} color="#AAA" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '60px', height: '4px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Small decorative playlist list */}
      <div
        className="xp-wmp-playlist-full"
        style={{
          padding: '8px 0',
          borderTop: '2px solid #555',
          flex: 1,
          overflowY: 'auto'
        }}
      >
        {playlist.map((track) => (
          <div
            key={track.id}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor:
                currentTrack?.id === track.id ? '#3169C6' : 'transparent',
              color: currentTrack?.id === track.id ? 'white' : '#DDD'
            }}
            onClick={() => {
              setCurrentTrack(track)
              setIsPlaying(true)
            }}
          >
            <span>
              {track.title} - {track.artist}
            </span>
            <span>{formatShortTime(track.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
