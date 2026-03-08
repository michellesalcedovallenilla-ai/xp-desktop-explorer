import { useCallback } from 'react'
import { useSystemStore } from '../../store/useSystemStore'
import { useWindowStore } from '../../store/useWindowStore'
import DesktopIcon from './DesktopIcon'

const Desktop = () => {
  const { desktopIcons, selectedIconId, setSelectedIconId } = useSystemStore()
  const { openWindow } = useWindowStore()

  const handleDesktopClick = useCallback(() => {
    setSelectedIconId(null)
  }, [setSelectedIconId])

  const handleIconDoubleClick = useCallback(
    (action: string) => {
      const windowConfig: Record<
        string,
        { type: string; title: string; width: number; height: number }
      > = {
        finder: { type: 'finder', title: 'My Computer', width: 750, height: 450 },
        about: { type: 'about', title: 'About Me', width: 700, height: 500 },
        contact: { type: 'contact', title: 'Contact', width: 600, height: 500 },
        resume: {
          type: 'resume',
          title: 'Resume.pdf',
          width: 650,
          height: 550
        },
        camera: { type: 'camera', title: 'Camera', width: 640, height: 520 },
        music: { type: 'music', title: 'Music', width: 700, height: 500 },
        minesweeper: { type: 'minesweeper', title: 'Games', width: 320, height: 420 },
        ie: { type: 'ie', title: 'Internet Explorer', width: 850, height: 600 }
      }
      const config = windowConfig[action]
      if (config) {
        openWindow({
          id: `window-${action}`,
          title: config.title,
          type: config.type as any,
          x: 150 + Math.random() * 100,
          y: 60 + Math.random() * 60,
          width: config.width,
          height: config.height,
          isMinimized: false,
          isMaximized: false
        })
      }
    },
    [openWindow]
  )

  return (
    <div
      className="desktop"
      onClick={handleDesktopClick}
    >
      {desktopIcons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
          isSelected={selectedIconId === icon.id}
          onSelect={() => setSelectedIconId(icon.id)}
          onDoubleClick={() => handleIconDoubleClick(icon.action)}
        />
      ))}
    </div>
  )
}

export default Desktop;
