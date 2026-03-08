import { useRef, useState, useCallback, useEffect } from 'react'

// XP Paint color palette - 2 rows of 14
const COLORS_ROW1 = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080',
  '#800080', '#808040', '#004040', '#0080FF', '#004080', '#4000FF', '#804000'
]
const COLORS_ROW2 = [
  '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF',
  '#FF00FF', '#FFFF80', '#00FF80', '#80FFFF', '#0080FF', '#FF0080', '#FF8040'
]

type ToolId = 'freeSelect' | 'rectSelect' | 'eraser' | 'fill' | 'picker' |
  'magnifier' | 'pencil' | 'brush' | 'airbrush' | 'text' | 'line' |
  'curve' | 'rect' | 'polygon' | 'ellipse' | 'roundRect'

interface ToolDef {
  id: ToolId
  icon: string
  title: string
}

const TOOLS: ToolDef[] = [
  { id: 'freeSelect', icon: '⭐', title: 'Free-Form Select' },
  { id: 'rectSelect', icon: '⬜', title: 'Select' },
  { id: 'eraser',     icon: '🧽', title: 'Eraser/Color Eraser' },
  { id: 'fill',       icon: '🪣', title: 'Fill With Color' },
  { id: 'picker',     icon: '💉', title: 'Pick Color' },
  { id: 'magnifier',  icon: '🔍', title: 'Magnifier' },
  { id: 'pencil',     icon: '✏️', title: 'Pencil' },
  { id: 'brush',      icon: '🖌️', title: 'Brush' },
  { id: 'airbrush',   icon: '💨', title: 'Airbrush' },
  { id: 'text',       icon: 'A',  title: 'Text' },
  { id: 'line',       icon: '╲',  title: 'Line' },
  { id: 'curve',      icon: '〰️', title: 'Curve' },
  { id: 'rect',       icon: '▭',  title: 'Rectangle' },
  { id: 'polygon',    icon: '⬠',  title: 'Polygon' },
  { id: 'ellipse',    icon: '◯',  title: 'Ellipse' },
  { id: 'roundRect',  icon: '▢',  title: 'Rounded Rectangle' },
]

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<ToolId>('pencil')
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF')
  const [brushSize, setBrushSize] = useState(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [snapshot, setSnapshot] = useState<ImageData | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Initialize canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const initCanvas = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      // Save existing content if any
      const prevData = canvas.width > 0 && canvas.height > 0
        ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (prevData) ctx.putImageData(prevData, 0, 0)
    }
    
    initCanvas()
    
    const observer = new ResizeObserver(() => initCanvas())
    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? (e as any).changedTouches?.[0]?.clientX ?? 0) : e.clientX
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? (e as any).changedTouches?.[0]?.clientY ?? 0) : e.clientY
    return {
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top)
    }
  }

  const floodFill = useCallback((startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const w = canvas.width
    const sx = Math.floor(startX), sy = Math.floor(startY)
    const targetIdx = (sy * w + sx) * 4
    const tR = data[targetIdx], tG = data[targetIdx + 1], tB = data[targetIdx + 2]
    const r = parseInt(fillColor.slice(1, 3), 16)
    const g = parseInt(fillColor.slice(3, 5), 16)
    const b = parseInt(fillColor.slice(5, 7), 16)
    if (tR === r && tG === g && tB === b) return
    const stack = [[sx, sy]]
    const visited = new Set<number>()
    while (stack.length > 0) {
      const [px, py] = stack.pop()!
      const idx = (py * w + px) * 4
      if (px < 0 || px >= w || py < 0 || py >= canvas.height || visited.has(idx)) continue
      if (Math.abs(data[idx] - tR) > 10 || Math.abs(data[idx + 1] - tG) > 10 || Math.abs(data[idx + 2] - tB) > 10) continue
      visited.add(idx)
      data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255
      stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1])
    }
    ctx.putImageData(imageData, 0, 0)
  }, [])

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    setStartPos(pos)

    if (tool === 'fill') {
      const c = ('button' in e && e.button === 2) ? secondaryColor : primaryColor
      floodFill(pos.x, pos.y, c)
      return
    }
    if (tool === 'picker') {
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data
      const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('')
      setPrimaryColor(hex)
      return
    }
    if (['line', 'rect', 'ellipse', 'roundRect', 'curve'].includes(tool)) {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height))
      return
    }
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? secondaryColor : primaryColor
    ctx.lineWidth = tool === 'brush' ? brushSize * 3 : tool === 'eraser' ? brushSize * 5 : tool === 'airbrush' ? 1 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    setMousePos(pos)
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (tool === 'airbrush') {
      const density = brushSize * 3
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * brushSize * 4
        const x = pos.x + Math.cos(angle) * radius
        const y = pos.y + Math.sin(angle) * radius
        ctx.fillStyle = primaryColor
        ctx.fillRect(x, y, 1, 1)
      }
    } else if (['line', 'rect', 'ellipse', 'roundRect'].includes(tool) && startPos && snapshot) {
      ctx.putImageData(snapshot, 0, 0)
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = brushSize
      ctx.beginPath()
      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y)
      } else if (tool === 'ellipse') {
        const rx = Math.abs(pos.x - startPos.x) / 2
        const ry = Math.abs(pos.y - startPos.y) / 2
        const cx = startPos.x + (pos.x - startPos.x) / 2
        const cy = startPos.y + (pos.y - startPos.y) / 2
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else if (tool === 'roundRect') {
        const x = Math.min(startPos.x, pos.x), y = Math.min(startPos.y, pos.y)
        const w = Math.abs(pos.x - startPos.x), h = Math.abs(pos.y - startPos.y)
        const r = Math.min(10, w / 4, h / 4)
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + w, y, x + w, y + h, r)
        ctx.arcTo(x + w, y + h, x, y + h, r)
        ctx.arcTo(x, y + h, x, y, r)
        ctx.arcTo(x, y, x + w, y, r)
        ctx.closePath()
        ctx.stroke()
      }
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setStartPos(null)
    setSnapshot(null)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div className="xp-paint">
      {/* Menu bar */}
      <div className="xp-paint-menubar">
        <span className="xp-paint-menu-item">File</span>
        <span className="xp-paint-menu-item">Edit</span>
        <span className="xp-paint-menu-item">View</span>
        <span className="xp-paint-menu-item" onClick={handleClear}>Image</span>
        <span className="xp-paint-menu-item">Colors</span>
        <span className="xp-paint-menu-item">Help</span>
      </div>

      <div className="xp-paint-workspace">
        {/* Tool sidebar - 2 columns of tools */}
        <div className="xp-paint-sidebar">
          <div className="xp-paint-toolbox">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                className={`xp-paint-tool-btn ${tool === t.id ? 'active' : ''}`}
                onClick={() => setTool(t.id)}
                title={t.title}
              >
                <span>{t.icon}</span>
              </button>
            ))}
          </div>
          {/* Brush size options */}
          <div className="xp-paint-options">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                className={`xp-paint-size-btn ${brushSize === s ? 'active' : ''}`}
                onClick={() => setBrushSize(s)}
                title={`Size ${s}`}
              >
                <div style={{
                  width: Math.min(s * 2, 16), height: Math.min(s * 2, 16),
                  background: '#000', borderRadius: tool === 'brush' ? '50%' : 0
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="xp-paint-canvas-area">
          <canvas
            ref={canvasRef}
            className="xp-paint-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>

      {/* Bottom: Color palette + status */}
      <div className="xp-paint-bottom">
        <div className="xp-paint-palette-area">
          {/* Current colors (primary over secondary) */}
          <div className="xp-paint-active-colors">
            <div
              className="xp-paint-fg"
              style={{ background: primaryColor }}
              title="Primary color (left click)"
            />
            <div
              className="xp-paint-bg"
              style={{ background: secondaryColor }}
              title="Secondary color (right click)"
            />
          </div>

          {/* Color grid: 2 rows */}
          <div className="xp-paint-color-grid">
            <div className="xp-paint-color-row">
              {COLORS_ROW1.map(c => (
                <button
                  key={c}
                  className="xp-paint-color-cell"
                  style={{ background: c }}
                  onClick={() => setPrimaryColor(c)}
                  onContextMenu={(e) => { e.preventDefault(); setSecondaryColor(c) }}
                  title={`Left: primary, Right: secondary`}
                />
              ))}
            </div>
            <div className="xp-paint-color-row">
              {COLORS_ROW2.map(c => (
                <button
                  key={c}
                  className="xp-paint-color-cell"
                  style={{ background: c }}
                  onClick={() => setPrimaryColor(c)}
                  onContextMenu={(e) => { e.preventDefault(); setSecondaryColor(c) }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="xp-paint-statusbar">
          <span>For Help, click Help Topics on the Help Menu.</span>
          <span>{mousePos.x}, {mousePos.y}px</span>
        </div>
      </div>
    </div>
  )
}
