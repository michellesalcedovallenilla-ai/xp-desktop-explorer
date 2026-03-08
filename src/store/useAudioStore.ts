import { create } from 'zustand'

interface AudioState {
  playClick: () => void
  playStartup: () => void
  playError: () => void
}

export const useAudioStore = create<AudioState>(() => {
  return {
    playClick: () => {},
    playStartup: () => {
      const audio = new Audio('/sounds/xp-startup.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})
    },
    playError: () => {}
  }
})
