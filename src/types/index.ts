export interface WindowState {
  id: string
  title: string
  type:
    | 'finder'
    | 'about'
    | 'contact'
    | 'resume'
    | 'camera'
    | 'music'
    | 'project'
    | 'paint'
    | 'minesweeper'
    | 'solitaire'
    | 'ie'
    | 'messenger'
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
  projectId?: string
  url?: string
}

export interface DesktopIconData {
  id: string
  label: string
  icon: string
  type: 'folder' | 'file' | 'app'
  action: string
  x: number
  y: number
  iconWidth?: number
  locked?: boolean
}

export interface DockItem {
  id: string
  label: string
  icon: string
  action: string
  isRunning: boolean
  isSeparator?: boolean
}

export interface WidgetState {
  id: string
  type: 'calculator' | 'weather' | 'clock' | 'calendar' | 'music' | 'notes'
  x: number
  y: number
  isVisible: boolean
  zIndex: number
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  youtubeId: string
  duration: number
}

export interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  image: string
  link?: string
  github?: string
}
