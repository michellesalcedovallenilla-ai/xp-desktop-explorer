import { create } from 'zustand'
import type {
  DesktopIconData,
  DockItem,
  MusicTrack,
  Note,
  WidgetState
} from '../types'
import { musicPlaylist } from '../data/projects'

interface SystemState {
  isBooting: boolean
  isLocked: boolean
  isShutdownVisible: boolean
  setBooting: (v: boolean) => void
  setLocked: (v: boolean) => void
  setShutdownVisible: (v: boolean) => void
  isDarkMode: boolean
  toggleDarkMode: () => void
  isSpotlightOpen: boolean
  setSpotlightOpen: (v: boolean) => void
  desktopIcons: DesktopIconData[]
  selectedIconId: string | null
  setSelectedIconId: (id: string | null) => void
  moveDesktopIcon: (id: string, x: number, y: number) => void
  dockItems: DockItem[]
  setDockItemRunning: (id: string, running: boolean) => void
  addDockItem: (item: DockItem) => void
  widgets: WidgetState[]
  moveWidget: (id: string, x: number, y: number) => void
  toggleWidget: (id: string) => void
  bringWidgetToFront: (id: string) => void
  currentTrack: MusicTrack | null
  isPlaying: boolean
  playlist: MusicTrack[]
  setCurrentTrack: (track: MusicTrack) => void
  setIsPlaying: (v: boolean) => void
  notes: Note[]
  activeNoteId: string | null
  setActiveNoteId: (id: string | null) => void
  addNote: (note: Note) => void
  updateNote: (id: string, content: string) => void
  deleteNote: (id: string) => void
  loadNotes: () => void
}

// Positions are in viewport percentages (vw/vh) so they align with the Bliss wallpaper on any screen
const defaultDesktopIcons: DesktopIconData[] = [
  // === SKY ANIMALS (flying creatures — clearly above the horizon) ===
  { id: 'ie', label: 'Internet Explorer', icon: 'ie', type: 'app', action: 'ie', x: 38, y: 4, iconWidth: 8 },
  { id: 'music', label: 'Music', icon: 'music', type: 'app', action: 'music', x: 12, y: 14, iconWidth: 7 },
  { id: 'camera', label: 'Camera', icon: 'camera', type: 'app', action: 'camera', x: 80, y: 6, iconWidth: 7 },
  { id: 'portfolio', label: 'Portfolio', icon: 'portfolio', type: 'app', action: 'portfolio-link', x: 58, y: 2, iconWidth: 7 },
  // === GROUND ANIMALS (standing on the Bliss hill, feet on grass) ===
  // Hill horizon: ~52-58% from top (higher on right, lower on left)
  { id: 'contact', label: 'Contact', icon: 'contact', type: 'app', action: 'contact', x: 5, y: 56, iconWidth: 7 },
  { id: 'about', label: 'About Me', icon: 'about', type: 'app', action: 'about', x: 26, y: 30, iconWidth: 10 },
  { id: 'myspace', label: 'MySpace', icon: 'myspace', type: 'app', action: 'myspace-link', x: 35, y: 28, iconWidth: 6 },
  { id: 'resume', label: 'Resume.pdf', icon: 'resume', type: 'file', action: 'resume', x: 42, y: 46, iconWidth: 8 },
  { id: 'minesweeper', label: 'Games', icon: 'minesweeper', type: 'app', action: 'minesweeper', x: 70, y: 32, iconWidth: 14 },
  { id: 'projects', label: 'Projects', icon: 'projects', type: 'folder', action: 'finder', x: 52, y: 38, iconWidth: 11 },
]

const defaultDockItems: DockItem[] = [
  { id: 'dock-finder', label: 'Finder', icon: 'Search', action: 'finder', isRunning: true },
  { id: 'dock-safari', label: 'Safari', icon: 'Globe', action: 'safari', isRunning: false },
  { id: 'dock-sep-1', label: '', icon: '', action: '', isRunning: false, isSeparator: true },
  { id: 'dock-projects', label: 'Projects', icon: 'FolderOpen', action: 'finder', isRunning: false },
  { id: 'dock-about', label: 'About', icon: 'User', action: 'about', isRunning: false },
  { id: 'dock-contact', label: 'Contact', icon: 'Mail', action: 'contact', isRunning: false },
  { id: 'dock-resume', label: 'Resume', icon: 'FileText', action: 'resume', isRunning: false },
  { id: 'dock-camera', label: 'Camera', icon: 'Camera', action: 'camera', isRunning: false },
  { id: 'dock-music', label: 'Music', icon: 'Music', action: 'music', isRunning: false },
  { id: 'dock-sep-2', label: '', icon: '', action: '', isRunning: false, isSeparator: true },
  { id: 'dock-trash', label: 'Trash', icon: 'Trash2', action: 'trash', isRunning: false }
]

const defaultWidgets: WidgetState[] = [
  { id: 'calculator', type: 'calculator', x: 500, y: 80, isVisible: false, zIndex: 100 },
  { id: 'weather', type: 'weather', x: 350, y: 80, isVisible: false, zIndex: 101 },
  { id: 'clock', type: 'clock', x: 200, y: 80, isVisible: false, zIndex: 102 },
  { id: 'calendar', type: 'calendar', x: 350, y: 250, isVisible: false, zIndex: 103 },
  { id: 'music', type: 'music', x: 500, y: 250, isVisible: false, zIndex: 104 },
  { id: 'notes', type: 'notes', x: 200, y: 250, isVisible: false, zIndex: 105 }
]

export const useSystemStore = create<SystemState>((set) => ({
  isBooting: true,
  isLocked: true,
  isShutdownVisible: false,
  setBooting: (v) => set({ isBooting: v }),
  setLocked: (v) => set({ isLocked: v }),
  setShutdownVisible: (v) => set({ isShutdownVisible: v }),
  isDarkMode: false,
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  isSpotlightOpen: false,
  setSpotlightOpen: (v) => set({ isSpotlightOpen: v }),
  desktopIcons: defaultDesktopIcons,
  selectedIconId: null,
  setSelectedIconId: (id) => set({ selectedIconId: id }),
  moveDesktopIcon: (id, x, y) =>
    set((s) => ({
      desktopIcons: s.desktopIcons.map((i) => (i.id === id ? { ...i, x, y } : i))
    })),
  dockItems: defaultDockItems,
  setDockItemRunning: (id, running) =>
    set((s) => ({
      dockItems: s.dockItems.map((i) => (i.id === id ? { ...i, isRunning: running } : i))
    })),
  addDockItem: (item) =>
    set((s) => {
      if (s.dockItems.find((i) => i.id === item.id)) return {}
      const lastSepIdx = s.dockItems.findIndex((i) => i.id === 'dock-sep-2')
      const newItems = [...s.dockItems]
      newItems.splice(lastSepIdx, 0, item)
      return { dockItems: newItems }
    }),
  widgets: defaultWidgets,
  moveWidget: (id, x, y) =>
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === id ? { ...w, x, y } : w))
    })),
  toggleWidget: (id) =>
    set((s) => {
      const target = s.widgets.find((w) => w.id === id)
      if (!target) return {}

      const willOpen = !target.isVisible
      const vw = window.innerWidth
      const vh = window.innerHeight
      const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

      const preferredPositions: Record<string, { x: number; y: number }> = {
        notes: { x: Math.round(vw * 0.16), y: Math.round(vh * 0.42) },
        music: { x: Math.round(vw * 0.44), y: Math.round(vh * 0.42) }
      }

      const widgetWidths: Record<string, number> = { notes: 340, music: 320 }
      const widgetHeights: Record<string, number> = { notes: 290, music: 280 }
      const preferred = willOpen ? preferredPositions[id] : undefined

      return {
        widgets: s.widgets.map((w) => {
          if (w.id !== id) return w
          if (!preferred) return { ...w, isVisible: !w.isVisible }

          const maxX = Math.max(0, vw - (widgetWidths[id] ?? 240) - 8)
          const maxY = Math.max(30, vh - (widgetHeights[id] ?? 240) - 40)

          return {
            ...w,
            isVisible: true,
            x: clamp(preferred.x, 0, maxX),
            y: clamp(preferred.y, 30, maxY)
          }
        })
      }
    }),
  bringWidgetToFront: (id) =>
    set((s) => {
      const maxZ = Math.max(...s.widgets.map((w) => w.zIndex))
      return {
        widgets: s.widgets.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w))
      }
    }),
  currentTrack: musicPlaylist[0],
  isPlaying: false,
  playlist: musicPlaylist,
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  notes: [],
  activeNoteId: null,
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  addNote: (note) =>
    set((s) => {
      const notes = [note, ...s.notes]
      localStorage.setItem('aero-notes', JSON.stringify(notes))
      return { notes, activeNoteId: note.id }
    }),
  updateNote: (id, content) =>
    set((s) => {
      const notes = s.notes.map((n) =>
        n.id === id
          ? { ...n, content, title: content.split('\n')[0]?.slice(0, 30) || 'Untitled', updatedAt: new Date().toISOString() }
          : n
      )
      localStorage.setItem('aero-notes', JSON.stringify(notes))
      return { notes }
    }),
  deleteNote: (id) =>
    set((s) => {
      const notes = s.notes.filter((n) => n.id !== id)
      localStorage.setItem('aero-notes', JSON.stringify(notes))
      return { notes, activeNoteId: notes[0]?.id ?? null }
    }),
  loadNotes: () => {
    try {
      const saved = localStorage.getItem('aero-notes')
      if (saved) {
        const notes = JSON.parse(saved) as Note[]
        set({ notes, activeNoteId: notes[0]?.id ?? null })
      }
    } catch {
      // ignore
    }
  }
}))
