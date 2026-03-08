import { useRef, useState, useCallback, useEffect } from 'react'

const COLORS = [
  '#000000',
  '#808080',
  '#800000',
  '#808000',
  '#008000',
  '#008080',
  '#000080',
  '#800080',
  '#FFFFFF',
  '#C0C0C0',
  '#FF0000',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#FF00FF',
  '#C08040',
  '#604020',
  '#FF8000',
  '#80FF00',
  '#00FF80',
  '#0080FF',
  '#8000FF',
  '#FF0080',
  '#FFD0D0',
  '#FFE0C0',
  '#FFFFC0',
  '#D0FFD0',
  '#D0FFFF',
  '#D0D0FF'
]

const TOOLS = [
  { id: 'pencil', label: '✏️', title: 'Pencil' },
  { id: 'brush', label: '🖌️', title: 'Brush' },
  { id: 'eraser', label: '🧽', title: 'Eraser' },
  { id: 'fill', label: '🪣', title: 'Fill' },
  { id: 'line', label: '📏', title: 'Line' },
  { id: 'rect', label: '⬜', title: 'Rectangle' },
  { id: 'circle', label: '⭕', title: 'Ellipse' },
  { id: 'text', label: '🔤', title: 'Text' }
]

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  )
  const [snapshot, setSnapshot] = useState<ImageData | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const floodFill = useCallback(
    (startX: number, startY: number, fillColor: string) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const w = canvas.width
      const targetIdx = (Math.floor(startY) * w + Math.floor(startX)) * 4
      const targetR = data[targetIdx],
        targetG = data[targetIdx + 1],
        targetB = data[targetIdx + 2]
      const r = parseInt(fillColor.slice(1, 3), 16),
        g = parseInt(fillColor.slice(3, 5), 16),
        b = parseInt(fillColor.slice(5, 7), 16)
      if (targetR === r && targetG === g && targetB === b) return
      const stack = [[Math.floor(startX), Math.floor(startY)]]
      const visited = new Set<number>()
      while (stack.length > 0) {
        const [px, py] = stack.pop()!
        const idx = (py * w + px) * 4
        if (
          px < 0 ||
          px >= w ||
          py < 0 ||
          py >= canvas.height ||
          visited.has(idx)
        )
          continue
        if (
          Math.abs(data[idx] - targetR) > 10 ||
          Math.abs(data[idx + 1] - targetG) > 10 ||
          Math.abs(data[idx + 2] - targetB) > 10
        )
          continue
        visited.add(idx)
        data[idx] = r
        data[idx + 1] = g
        data[idx + 2] = b
        data[idx + 3] = 255
        stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1])
      }
      ctx.putImageData(imageData, 0, 0)
    },
    []
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    setStartPos(pos)

    if (tool === 'fill') {
      floodFill(pos.x, pos.y, color)
      return
    }
    if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height))
      return
    }
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
    ctx.lineWidth =
      tool === 'brush'
        ? brushSize * 3
        : tool === 'eraser'
          ? brushSize * 5
          : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    const pos = getPos(e)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (
      (tool === 'line' || tool === 'rect' || tool === 'circle') &&
      startPos &&
      snapshot
    ) {
      ctx.putImageData(snapshot, 0, 0)
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.beginPath()
      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (tool === 'rect') {
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          pos.x - startPos.x,
          pos.y - startPos.y
        )
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - startPos.x) / 2
        const ry = Math.abs(pos.y - startPos.y) / 2
        const cx = startPos.x + (pos.x - startPos.x) / 2
        const cy = startPos.y + (pos.y - startPos.y) / 2
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
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

  return (
    <div className="xp-paint">
      <div className="xp-paint-menu">
        <button className="xp-calc-menu-item">File</button>
        <button className="xp-calc-menu-item">Edit</button>
        <button className="xp-calc-menu-item">View</button>
        <button className="xp-calc-menu-item" onClick={handleClear}>
          Image
        </button>
        <button className="xp-calc-menu-item">Colors</button>
        <button className="xp-calc-menu-item">Help</button>
      </div>
      <div className="xp-paint-body">
        {/* Toolbox */}
        <div className="xp-paint-tools">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`xp-paint-tool ${tool === t.id ? 'active' : ''}`}
              onClick={() => setTool(t.id)}
              title={t.title}
            >
              {t.label}
            </button>
          ))}
          <div className="xp-paint-size">
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </div>
          <button
            className="xp-paint-tool"
            onClick={handleClear}
            title="Clear All"
          >
            🗑️
          </button>
        </div>

        {/* Canvas */}
        <div className="xp-paint-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="xp-paint-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Color palette */}
      <div className="xp-paint-palette">
        <div className="xp-paint-current-color" style={{ background: color }} />
        <div className="xp-paint-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`xp-paint-color-btn ${c === color ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
