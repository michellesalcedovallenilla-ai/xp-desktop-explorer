import { useEffect } from 'react'
import { useSystemStore } from '../store/useSystemStore'
import { useWindowStore } from '../store/useWindowStore'

export function useKeyboardShortcuts() {
  const { setSpotlightOpen, isSpotlightOpen } = useSystemStore()
  const { closeWindow, minimizeWindow, windows } = useWindowStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey

      if (isCmd && e.key === 'k') {
        e.preventDefault()
        setSpotlightOpen(!isSpotlightOpen)
      }

      if (isCmd && e.key === 'w') {
        e.preventDefault()
        const topWindow = windows
          .filter((w) => !w.isMinimized)
          .sort((a, b) => b.zIndex - a.zIndex)[0]
        if (topWindow) closeWindow(topWindow.id)
      }

      if (isCmd && e.key === 'm') {
        e.preventDefault()
        const topWindow = windows
          .filter((w) => !w.isMinimized)
          .sort((a, b) => b.zIndex - a.zIndex)[0]
        if (topWindow) minimizeWindow(topWindow.id)
      }

      if (e.key === 'Escape') {
        if (isSpotlightOpen) setSpotlightOpen(false)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isSpotlightOpen, windows, setSpotlightOpen, closeWindow, minimizeWindow])
}
