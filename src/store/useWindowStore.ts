import { create } from 'zustand'
import type { WindowState } from '../types'

interface WindowStore {
  windows: WindowState[]
  nextZIndex: number
  openWindow: (win: Omit<WindowState, 'zIndex'>) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],
  nextZIndex: 10,
  openWindow: (win) =>
    set((s) => {
      const existing = s.windows.find((w) => w.id === win.id)
      if (existing) {
        return {
          windows: s.windows.map((w) => w.id === win.id ? { ...w, isMinimized: false, zIndex: s.nextZIndex } : w),
          nextZIndex: s.nextZIndex + 1
        }
      }
      return {
        windows: [...s.windows, { ...win, zIndex: s.nextZIndex }],
        nextZIndex: s.nextZIndex + 1
      }
    }),
  closeWindow: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),
  minimizeWindow: (id) => set((s) => ({ windows: s.windows.map((w) => w.id === id ? { ...w, isMinimized: true } : w) })),
  restoreWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => w.id === id ? { ...w, isMinimized: false, zIndex: s.nextZIndex } : w),
      nextZIndex: s.nextZIndex + 1
    })),
  maximizeWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMaximized: !w.isMaximized,
              x: w.isMaximized ? 100 : 0,
              y: w.isMaximized ? 50 : 0,
              width: w.isMaximized ? 800 : window.innerWidth,
              height: w.isMaximized ? 500 : window.innerHeight - 30
            }
          : w
      )
    })),
  focusWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => w.id === id ? { ...w, zIndex: s.nextZIndex } : w),
      nextZIndex: s.nextZIndex + 1
    })),
  moveWindow: (id, x, y) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),
  resizeWindow: (id, width, height) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, width, height } : w)) }))
}))
