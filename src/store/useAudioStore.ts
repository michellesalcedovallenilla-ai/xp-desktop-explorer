import { create } from 'zustand'

const playSound = (src: string, volume = 0.4) => {
  const audio = new Audio(src)
  audio.volume = volume
  audio.play().catch(() => {})
}

interface AudioState {
  playClick: () => void
  playStartup: () => void
  playError: () => void
  playDing: () => void
  playShutdown: () => void
  playShutter: () => void
}

export const useAudioStore = create<AudioState>(() => ({
  playClick: () => playSound('/sounds/xp-ding.mp3', 0.15),
  playStartup: () => playSound('/sounds/xp-startup.mp3', 0.5),
  playError: () => playSound('/sounds/xp-error.mp3', 0.4),
  playDing: () => playSound('/sounds/xp-ding.mp3', 0.3),
  playShutdown: () => playSound('/sounds/xp-shutdown.mp3', 0.5),
  playShutter: () => playSound('/sounds/shutter.mp3', 0.6),
}))
