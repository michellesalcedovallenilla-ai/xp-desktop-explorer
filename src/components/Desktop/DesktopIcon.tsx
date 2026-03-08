import { useState, useEffect } from 'react'
import { useWindowStore } from '../../store/useWindowStore'
import { useSystemStore } from '../../store/useSystemStore'
import type { DesktopIconData } from '../../types'

// Map icon IDs to animal image paths
const ICON_IMAGES: Record<string, { src: string; alt: string }> = {
  hd: { src: '/animals/cat-ii.png', alt: 'Cat - My Computer' },
  projects: { src: '/animals/cow-iii.png', alt: 'Cow - Projects' },
  music: { src: '/animals/fish-flying.png', alt: 'Fish - Music' },
  camera: { src: '/animals/pig-flying.png', alt: 'Pig - Camera' },
  minesweeper: { src: '/animals/dino.png', alt: 'Dinosaur - Games' },
  about: { src: '/animals/oso.png', alt: 'Bear - About Me' },
  contact: { src: '/animals/chiguire.png', alt: 'Capybara - Contact' },
  ie: { src: '/animals/cat-flying.png', alt: 'Cat - Internet Explorer' },
  resume: { src: '/animals/cat.png', alt: 'Cat - Resume' }
}

interface Props {
  icon: DesktopIconData
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
}

const DesktopIcon = ({ icon, isSelected, onSelect, onDoubleClick }: Props) => {
  const { openWindow } = useWindowStore()
  const { moveDesktopIcon } = useSystemStore()
  const [imgError, setImgError] = useState(false)
  const animal = ICON_IMAGES[icon.icon] || ICON_IMAGES[icon.id] || ICON_IMAGES[icon.action]
  const iconWidth = icon.iconWidth || 120

  const handleOpen = () => {
    const winTypes: Record<string, string> = {
      finder: 'finder',
      about: 'about',
      contact: 'contact',
      resume: 'resume',
      camera: 'camera',
      music: 'music',
      paint: 'paint',
      minesweeper: 'minesweeper',
      solitaire: 'solitaire',
      ie: 'ie'
    }
    const type = winTypes[icon.action] || 'finder'
    openWindow({
      id: `window-${icon.action}-${icon.id}`,
      title: icon.label,
      type: type as any,
      x: 150 + Math.random() * 200,
      y: 50 + Math.random() * 100,
      width:
        type === 'ie'
          ? 850
          : type === 'paint'
            ? 750
            : type === 'solitaire'
              ? 700
              : type === 'minesweeper'
                ? 320
                : 650,
      height:
        type === 'ie'
          ? 600
          : type === 'paint'
            ? 550
            : type === 'solitaire'
              ? 550
              : type === 'minesweeper'
                ? 420
                : 480,
      isMinimized: false,
      isMaximized: false
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (icon.locked) return
    const startX = e.clientX
    const startY = e.clientY
    const origX = icon.x
    const origY = icon.y
    let moved = false

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true
      if (moved) {
        const nx = Math.max(0, Math.min(window.innerWidth - iconWidth, origX + dx))
        const ny = Math.max(0, Math.min(window.innerHeight - 120, origY + dy))
        moveDesktopIcon(icon.id, nx, ny)
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = ''
    }
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      className={`xp-landscape-icon ${isSelected ? 'selected' : ''}`}
      style={{ left: icon.x, top: icon.y, width: iconWidth }}
      onMouseDown={(e) => {
        onSelect()
        handleMouseDown(e)
      }}
      onDoubleClick={() => {
        onDoubleClick()
      }}
    >
      {animal && !imgError ? (
        <img
          src={animal.src}
          alt={animal.alt}
          className="xp-landscape-animal"
          style={{ width: iconWidth }}
          draggable={false}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{ width: iconWidth, height: iconWidth * 0.75, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }} />
      )}
      <span className="xp-landscape-label">{icon.label}</span>
    </div>
  )
}

export default DesktopIcon;
