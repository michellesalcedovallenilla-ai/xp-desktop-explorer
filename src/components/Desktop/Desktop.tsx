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
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isMobile = vw <= 480
      const isTablet = vw > 480 && vw <= 768

      const windowConfig: Record<
        string,
        { type: string; title: string; width: number; height: number }
      > = {
        finder: { type: 'finder', title: 'My Computer', width: isMobile ? vw : isTablet ? 500 : 750, height: isMobile ? vh - 50 : isTablet ? 400 : 450 },
        about: { type: 'about', title: 'About Me', width: isMobile ? vw : isTablet ? 500 : 700, height: isMobile ? vh - 50 : isTablet ? 420 : 500 },
        contact: { type: 'contact', title: 'Contact', width: isMobile ? vw : isTablet ? 480 : 600, height: isMobile ? vh - 50 : isTablet ? 420 : 500 },
        resume: { type: 'resume', title: 'Resume.pdf', width: isMobile ? vw : isTablet ? 500 : 650, height: isMobile ? vh - 50 : isTablet ? 450 : 550 },
        camera: { type: 'camera', title: 'Camera', width: isMobile ? vw : isTablet ? 480 : 640, height: isMobile ? vh - 50 : isTablet ? 420 : 520 },
        music: { type: 'music', title: 'Music', width: isMobile ? vw : isTablet ? 480 : 700, height: isMobile ? vh - 50 : isTablet ? 420 : 500 },
        minesweeper: { type: 'minesweeper', title: 'Games', width: isMobile ? vw : 320, height: isMobile ? vh - 50 : 420 },
        ie: { type: 'ie', title: 'Internet Explorer', width: isMobile ? vw : isTablet ? 600 : 850, height: isMobile ? vh - 50 : isTablet ? 450 : 600 },
        messenger: { type: 'messenger', title: 'MSN Messenger - Guestbook', width: isMobile ? vw : isTablet ? 420 : 500, height: isMobile ? vh - 50 : isTablet ? 450 : 550 }
      }
      const config = windowConfig[action]
      if (config) {
        const x = isMobile ? 0 : isTablet ? Math.random() * 40 : 150 + Math.random() * 100
        const y = isMobile ? 0 : isTablet ? Math.random() * 30 : 60 + Math.random() * 60
        openWindow({
          id: `window-${action}`,
          title: config.title,
          type: config.type as any,
          x,
          y,
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
