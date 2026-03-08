import { create } from 'zustand'

interface AudioState {
  playClick: () => void
  playStartup: () => void
  playError: () => void
}

export const useAudioStore = create<AudioState>(() => {
  return {
    playClick: () => {},
    playStartup: () => {},
    playError: () => {}
  }
})
