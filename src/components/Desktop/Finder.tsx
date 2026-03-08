import { useState } from 'react'
import {
  FolderOpen,
  FileText,
  Image,
  Music,
  Monitor,
  User,
  Mail,
  ArrowLeft
} from 'lucide-react'
import { useWindowStore } from '../../store/useWindowStore'
import { projects } from '../../data/projects'

const folders = [
  { label: 'My Documents', icon: FolderOpen, path: 'documents' },
  { label: 'My Pictures', icon: Image, path: 'pictures' },
  { label: 'My Music', icon: Music, path: 'music' },
  { label: 'My Computer', icon: Monitor, path: 'computer' }
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

const pictures = [
  { label: 'michael-scott.png', src: '/pictures/michael-scott.png' },
  { label: 'born-designer.png', src: '/pictures/born-designer.png' },
  { label: 'i-love-graphic-design.png', src: '/pictures/i-love-graphic-design.png' },
  { label: 'graphic-design-passion.png', src: '/pictures/graphic-design-passion.png' },
  { label: 'paint-passion.png', src: '/pictures/paint-passion.png' },
  { label: 'snoopy-dilly-dally.png', src: '/pictures/snoopy-dilly-dally.png' },
  { label: 'webby-nook.png', src: '/pictures/webby-nook.png' },
  { label: 'party-cow.png', src: '/pictures/party-cow.png' },
]

export default function Finder({ initialPath }: { initialPath?: string }) {
  const { openWindow } = useWindowStore()
  const [currentPath, setCurrentPath] = useState<string>(initialPath || 'documents')
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null)

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

  const addressPath = currentPath === 'pictures' 
    ? 'C:\\My Documents\\My Pictures' 
    : 'C:\\My Documents'

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
              <button 
                key={f.label} 
                className="xp-explorer-sidebar-item"
                onClick={() => { setCurrentPath(f.path); setSelectedPicture(null) }}
              >
                <Icon size={14} /> {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* File grid */}
      <div className="xp-explorer-content">
        <div className="xp-explorer-address-bar">
          {currentPath !== 'documents' && (
            <button 
              onClick={() => { setCurrentPath('documents'); setSelectedPicture(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <span>Address</span>
          <div className="xp-address-path">{addressPath}</div>
        </div>

        {/* Picture lightbox */}
        {selectedPicture && (
          <div 
            style={{
              position: 'absolute', inset: 0, zIndex: 50, 
              background: 'rgba(0,0,0,0.85)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
            onClick={() => setSelectedPicture(null)}
          >
            <img 
              src={selectedPicture} 
              alt="" 
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 4 }} 
            />
          </div>
        )}

        <div className="xp-explorer-grid">
          {currentPath === 'documents' && (
            <>
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
                  onClick={() => {
                    if (p.link) {
                      window.open(p.link, '_blank')
                    } else {
                      openProject(p.id, p.title)
                    }
                  }}
                >
                  <div className="xp-explorer-file-icon">
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{ width: 32, height: 32, objectFit: 'contain' }}
                      draggable={false}
                    />
                  </div>
                  <span className="xp-explorer-file-name">{p.title}</span>
                </button>
              ))}
            </>
          )}

          {currentPath === 'pictures' && pictures.map((pic) => (
            <button
              key={pic.label}
              className="xp-explorer-file"
              onClick={() => setSelectedPicture(pic.src)}
            >
              <div className="xp-explorer-file-icon">
                <img
                  src={pic.src}
                  alt={pic.label}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 2, border: '1px solid #ccc' }}
                  draggable={false}
                />
              </div>
              <span className="xp-explorer-file-name">{pic.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
