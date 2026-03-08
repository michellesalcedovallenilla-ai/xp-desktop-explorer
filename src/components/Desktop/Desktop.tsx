import { useCallback } from 'react'
import { useSystemStore } from '../../store/useSystemStore'
import { useWindowStore } from '../../store/useWindowStore'
import { useErrorDialogStore } from '../../store/useErrorDialogStore'
import DesktopIcon from './DesktopIcon'

const Desktop = () => {
  const { desktopIcons, selectedIconId, setSelectedIconId } = useSystemStore()
  const { openWindow } = useWindowStore()
  const { showError } = useErrorDialogStore()

  const handleDesktopClick = useCallback(() => {
    setSelectedIconId(null)
  }, [setSelectedIconId])

  const handleIconDoubleClick = useCallback(
    (action: string) => {
      const { windows, closeWindow } = useWindowStore.getState()
      const windowId = `window-${action}`
      const existing = windows.find((w) => w.id === windowId)

      if (existing) {
        closeWindow(windowId)
        return
      }

      const vw = window.innerWidth
      const vh = window.innerHeight
      const isMobile = vw <= 480
      const isTablet = vw > 480 && vw <= 768
      const isSmallLaptop = vw > 768 && vw <= 1024

      const w = (mobile: number, tablet: number, smallLaptop: number, desktop: number) =>
        isMobile ? mobile : isTablet ? tablet : isSmallLaptop ? smallLaptop : desktop
      const h = (mobile: number, tablet: number, smallLaptop: number, desktop: number) =>
        isMobile ? mobile : isTablet ? tablet : isSmallLaptop ? smallLaptop : desktop

      const windowConfig: Record<
        string,
        { type: string; title: string; width: number; height: number }
      > = {
        finder: { type: 'finder', title: 'My Computer', width: w(vw, 500, 550, 750), height: h(vh - 50, 400, 380, 450) },
        about: { type: 'about', title: 'About Me', width: w(vw, 500, 520, 700), height: h(vh - 50, 420, 400, 500) },
        contact: { type: 'contact', title: 'Contact', width: w(vw, 480, 450, 600), height: h(vh - 50, 420, 380, 500) },
        resume: { type: 'resume', title: 'Resume.pdf', width: w(vw, 500, 500, 650), height: h(vh - 50, 450, 420, 550) },
        camera: { type: 'camera', title: 'Camera', width: w(vw, 480, 480, 640), height: h(vh - 50, 420, 380, 520) },
        music: { type: 'music', title: 'Music', width: w(vw, 480, 500, 700), height: h(vh - 50, 420, 400, 500) },
        minesweeper: { type: 'minesweeper', title: 'Games', width: w(vw, 320, 300, 320), height: h(vh - 50, 420, 380, 420) },
        ie: { type: 'ie', title: 'Internet Explorer', width: w(vw, 600, 650, 850), height: h(vh - 50, 450, 420, 600) },
        messenger: { type: 'messenger', title: 'MSN Messenger - Guestbook', width: w(vw, 420, 400, 500), height: h(vh - 50, 450, 420, 550) },
        video: { type: 'video', title: 'Windows Media Player', width: w(vw, 500, 520, 640), height: h(vh - 50, 450, 420, 520) }
      }
      const config = windowConfig[action]
      if (config) {
        const x = isMobile ? 0 : isTablet ? Math.random() * 40 : 150 + Math.random() * 100
        const y = isMobile ? 0 : isTablet ? Math.random() * 30 : 60 + Math.random() * 60
        openWindow({
          id: windowId,
          title: config.title,
          type: config.type as any,
          x,
          y,
          width: config.width,
          height: config.height,
          isMinimized: false,
          isMaximized: false
        })
      } else {
        showError(undefined, undefined)
      }
    },
    [openWindow]
  )

  const handleSunClick = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const isMobile = vw <= 480
    const isTablet = vw > 480 && vw <= 768
    const isSmallLaptop = vw > 768 && vw <= 1024
    const sz = (m: number, t: number, sl: number, d: number) =>
      isMobile ? m : isTablet ? t : isSmallLaptop ? sl : d
    openWindow({
      id: 'window-messenger',
      title: 'MSN Messenger - Guestbook',
      type: 'messenger',
      x: isMobile ? 0 : 150,
      y: isMobile ? 0 : 60,
      width: sz(vw, 420, 400, 500),
      height: sz(vh - 50, 450, 420, 550),
      isMinimized: false,
      isMaximized: false
    })
  }, [openWindow])

  return (
    <div
      className="desktop"
      onClick={handleDesktopClick}
    >
      {/* Sun - MSN Messenger shortcut */}
      <div className="xp-sun-wrapper" onClick={handleSunClick}>
        <img src="/animals/sun.png" alt="Sun - Click for MSN Messenger" className="xp-sun-img" draggable={false} />
        <span className="xp-sun-label">CLICK HERE!</span>
      </div>

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
