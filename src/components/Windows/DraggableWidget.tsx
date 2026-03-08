import { type ReactNode, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSystemStore } from '../../store/useSystemStore'

interface Props {
  id: string
  title: string
  children: ReactNode
  className?: string
}

export default function DraggableWidget({
  id,
  title,
  children,
  className = ''
}: Props) {
  const { widgets, moveWidget, toggleWidget, bringWidgetToFront } =
    useSystemStore()
  const widget = widgets.find((w) => w.id === id)
  const dragRef = useRef<{
    isDragging: boolean
    startX: number
    startY: number
    origX: number
    origY: number
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0
  })

  if (!widget || !widget.isVisible) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    bringWidgetToFront(id)
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: widget.x,
      origY: widget.y
    }

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.isDragging) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      moveWidget(id, dragRef.current.origX + dx, dragRef.current.origY + dy)
    }

    const onUp = () => {
      dragRef.current.isDragging = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.pointerEvents = ''
    }

    document.body.style.pointerEvents = 'none' // Prevent iframe/content interference while dragging
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseup', onUp)
  }

  // Clamp position to viewport
  const clampedX = Math.min(widget.x, window.innerWidth - 200)
  const clampedY = Math.min(widget.y, window.innerHeight - 200)

  return (
    <motion.div
      className={`xp-widget ${className}`}
      style={{
        left: Math.max(0, clampedX),
        top: Math.max(30, clampedY),
        zIndex: widget.zIndex,
        position: 'absolute',
        pointerEvents: 'auto'
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDownCapture={() => bringWidgetToFront(id)}
    >
      {/* XP Title Bar */}
      <div
        className="xp-widget-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'url(/graphics/assets/pixel-cursor.png), move' }}
      >
        <span className="xp-widget-title">{title}</span>
        <div
          className="xp-widget-controls"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="xp-wctrl xp-wctrl-min" title="Minimize" onClick={() => toggleWidget(id)}>
            <svg viewBox="0 0 10 10" width="9" height="9">
              <rect x="1" y="7" width="8" height="2" fill="white" />
            </svg>
          </button>
          <button
            className="xp-wctrl xp-wctrl-close"
            onClick={() => toggleWidget(id)}
            title="Close"
          >
            <svg viewBox="0 0 10 10" width="9" height="9">
              <line
                x1="2"
                y1="2"
                x2="8"
                y2="8"
                stroke="white"
                strokeWidth="1.8"
              />
              <line
                x1="8"
                y1="2"
                x2="2"
                y2="8"
                stroke="white"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="xp-widget-content">{children}</div>
    </motion.div>
  )
}
