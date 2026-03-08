import {
  FolderOpen,
  FileText,
  Image,
  Music,
  Monitor,
  User,
  Mail
} from 'lucide-react'
import { useWindowStore } from '../../store/useWindowStore'
import { projects } from '../../data/projects'

const folders = [
  { label: 'My Documents', icon: FolderOpen },
  { label: 'My Pictures', icon: Image },
  { label: 'My Music', icon: Music },
  { label: 'My Computer', icon: Monitor }
]

const files = [
  { label: 'About Me.lnk', icon: '/icons/xp-about.png', action: 'about' },
  { label: 'Contact.lnk', icon: '/icons/xp-contact.png', action: 'contact' },
  { label: 'Resume.pdf', icon: '/icons/xp-resume.png', action: 'resume' },
  { label: 'Camera.exe', icon: '/icons/xp-camera.png', action: 'camera' },
  { label: 'Music Player.exe', icon: '/icons/xp-music.png', action: 'music' },
  { label: 'MS Paint.exe', icon: '/icons/xp-paint.png', action: 'paint' },
  { label: 'Minesweeper.exe', icon: '/icons/xp-minesweeper.png', action: 'minesweeper' }
]

export default function Finder() {
  const { openWindow } = useWindowStore()

  const openItem = (action: string, title: string) => {
    openWindow({
      id: `window-${action}`,
      title,
      type: action as any,
      x: 120 + Math.random() * 100,
      y: 60 + Math.random() * 60,
      width: 700,
      height: 500,
      isMinimized: false,
      isMaximized: false
    })
  }

  const openProject = (projId: string, title: string) => {
    openWindow({
      id: `window-project-${projId}`,
      title,
      type: 'project',
      x: 150 + Math.random() * 100,
      y: 80 + Math.random() * 50,
      width: 650,
      height: 480,
      isMinimized: false,
      isMaximized: false,
      projectId: projId
    })
  }

  return (
    <div className="xp-explorer">
      {/* Sidebar / Tasks pane */}
      <div className="xp-explorer-sidebar">
        <div className="xp-explorer-sidebar-section">
          <div className="xp-explorer-sidebar-title">System Tasks</div>
          <button
            className="xp-explorer-sidebar-item"
            onClick={() => openItem('about', 'About Me')}
          >
            <User size={14} /> View About Me
          </button>
          <button
            className="xp-explorer-sidebar-item"
            onClick={() => openItem('contact', 'Contact')}
          >
            <Mail size={14} /> Send a Message
          </button>
          <button
            className="xp-explorer-sidebar-item"
            onClick={() => openItem('resume', 'Resume.pdf')}
          >
            <FileText size={14} /> View Resume
          </button>
        </div>
        <div className="xp-explorer-sidebar-section">
          <div className="xp-explorer-sidebar-title">Other Places</div>
          {folders.map((f) => {
            const Icon = f.icon
            return (
              <button key={f.label} className="xp-explorer-sidebar-item">
                <Icon size={14} /> {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* File grid */}
      <div className="xp-explorer-content">
        <div className="xp-explorer-address-bar">
          <span>Address</span>
          <div className="xp-address-path">C:\My Documents</div>
        </div>
        <div className="xp-explorer-grid">
          {files.map((f) => (
            <button
              key={f.label}
              className="xp-explorer-file"
              onClick={() =>
                openItem(
                  f.action,
                  f.label.replace('.lnk', '').replace('.exe', '').replace('.pdf', '')
                )
              }
            >
              <div className="xp-explorer-file-icon">
                <img
                  src={f.icon}
                  alt={f.label}
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
              <span className="xp-explorer-file-name">{f.label}</span>
            </button>
          ))}
          {projects.map((p) => (
            <button
              key={p.id}
              className="xp-explorer-file"
              onClick={() => openProject(p.id, p.title)}
            >
              <div className="xp-explorer-file-icon">
                <span style={{ fontSize: 28 }}>{p.image}</span>
              </div>
              <span className="xp-explorer-file-name">{p.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
