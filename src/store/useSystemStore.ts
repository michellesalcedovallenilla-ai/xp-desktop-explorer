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

const defaultDesktopIcons: DesktopIconData[] = [
  { id: 'ie', label: 'Internet Explorer', icon: 'ie', type: 'app', action: 'ie', x: 570, y: 70, iconWidth: 120 },
  { id: 'music', label: 'Music', icon: 'music', type: 'app', action: 'music', x: 160, y: 150, iconWidth: 100 },
  { id: 'camera', label: 'Camera', icon: 'camera', type: 'app', action: 'camera', x: 1000, y: 100, iconWidth: 120 },
  { id: 'about', label: 'About Me', icon: 'about', type: 'app', action: 'about', x: 320, y: 260, iconWidth: 150 },
  { id: 'resume', label: 'Resume.pdf', icon: 'resume', type: 'file', action: 'resume', x: 500, y: 330, iconWidth: 120 },
  { id: 'contact', label: 'Contact', icon: 'contact', type: 'app', action: 'contact', x: 100, y: 380, iconWidth: 110 },
  { id: 'minesweeper', label: 'Games', icon: 'minesweeper', type: 'app', action: 'minesweeper', x: 1120, y: 270, iconWidth: 350 },
  { id: 'projects', label: 'Projects', icon: 'projects', type: 'folder', action: 'finder', x: 750, y: 280, iconWidth: 250 },
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
  { id: 'calculator', type: 'calculator', x: 900, y: 60, isVisible: false, zIndex: 100 },
  { id: 'weather', type: 'weather', x: 580, y: 60, isVisible: false, zIndex: 101 },
  { id: 'clock', type: 'clock', x: 370, y: 60, isVisible: false, zIndex: 102 },
  { id: 'calendar', type: 'calendar', x: 580, y: 370, isVisible: false, zIndex: 103 },
  { id: 'music', type: 'music', x: 900, y: 310, isVisible: false, zIndex: 104 },
  { id: 'notes', type: 'notes', x: 370, y: 370, isVisible: false, zIndex: 105 }
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
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    })),
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
