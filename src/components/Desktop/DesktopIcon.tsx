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
  resume: { src: '/animals/cat.png', alt: 'Cat - Resume' },
  msn: { src: '/animals/michelle.png', alt: 'Michelle - MSN Messenger' },
  portfolio: { src: '/animals/harina-pan.png', alt: 'Harina PAN - Portfolio' },
  myspace: { src: '/animals/cj.png', alt: 'CJ - MySpace' }
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
  // iconWidth is now in vw units
  const iconWidthVw = icon.iconWidth || 8

  useEffect(() => {
    setImgError(false)
  }, [animal?.src])

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
      ie: 'ie',
      messenger: 'messenger'
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
        // Convert pixel delta to viewport percentage delta
        const dxVw = (dx / window.innerWidth) * 100
        const dyVh = (dy / window.innerHeight) * 100
        const nx = Math.max(0, Math.min(95, origX + dxVw))
        const ny = Math.max(0, Math.min(90, origY + dyVh))
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
      style={{
        left: `${icon.x}vw`,
        top: `${icon.y}vh`,
        width: `${iconWidthVw}vw`
      }}
      onMouseDown={(e) => {
        onSelect()
        handleMouseDown(e)
      }}
      onDoubleClick={() => {
        if (icon.action === 'portfolio-link') {
          window.open('https://readymag.website/u2801101920/5411866/', '_blank')
        } else if (icon.action === 'myspace-link') {
          window.open('https://ifyourereadingthishiremenow.my.canva.site', '_blank')
        } else {
          onDoubleClick()
        }
      }}
    >
      {animal && !imgError ? (
        <img
          src={animal.src}
          alt={animal.alt}
          className="xp-landscape-animal"
          style={{ width: `${iconWidthVw}vw` }}
          draggable={false}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{ width: `${iconWidthVw}vw`, height: `${iconWidthVw * 0.75}vw`, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }} />
      )}
      <span className="xp-landscape-label">{icon.label}</span>
    </div>
  )
}

export default DesktopIcon;
