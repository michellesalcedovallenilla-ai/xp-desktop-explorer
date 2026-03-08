import { useState, useRef, useEffect } from 'react'
import {
  Minus,
  Square,
  X,
  Type,
  Eraser,
  Edit2,
  Droplet,
  Search
} from 'lucide-react'

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
  '#FF00FF'
]

export default function PaintViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [brushSize, setBrushSize] = useState(2)
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'fill' | 'picker'>(
    'pencil'
  )

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set white background initially
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'fill') {
      // Very basic fill (fills entire canvas for simplicity)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    if (tool === 'picker') {
      const p = ctx.getImageData(x, y, 1, 1).data
      const hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6)
      setColor(hex)
      setTool('pencil')
      return
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === 'eraser' ? bgColor : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    if (r > 255 || g > 255 || b > 255) throw 'Invalid color component'
    return ((r << 16) | (g << 8) | b).toString(16)
  }

  return (
    <div className="xp-paint-app">
      <div className="xp-paint-menu">
        <button className="xp-paint-menu-item">File</button>
        <button className="xp-paint-menu-item">Edit</button>
        <button className="xp-paint-menu-item">View</button>
        <button className="xp-paint-menu-item">Image</button>
        <button className="xp-paint-menu-item">Colors</button>
        <button className="xp-paint-menu-item">Help</button>
      </div>

      <div className="xp-paint-workspace">
        <div className="xp-paint-sidebar">
          <div className="xp-paint-tools">
            <button
              className={`xp-paint-tool ${tool === 'pencil' ? 'active' : ''}`}
              onClick={() => setTool('pencil')}
              title="Pencil"
            >
              <Edit2 size={12} />
            </button>
            <button
              className={`xp-paint-tool ${tool === 'fill' ? 'active' : ''}`}
              onClick={() => setTool('fill')}
              title="Fill Color"
            >
              <Droplet size={12} />
            </button>
            <button
              className={`xp-paint-tool ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Eraser"
            >
              <Eraser size={12} />
            </button>
            <button
              className={`xp-paint-tool ${tool === 'picker' ? 'active' : ''}`}
              onClick={() => setTool('picker')}
              title="Pick Color"
            >
              <Search size={12} />
            </button>
          </div>

          <div className="xp-paint-brush-sizes">
            <label>Brush/Eraser Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="xp-paint-slider"
            />
          </div>

          <button className="xp-paint-clear-btn" onClick={clearCanvas}>
            Clear Image
          </button>
        </div>

        <div className="xp-paint-canvas-container">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="xp-paint-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
        </div>
      </div>

      <div className="xp-paint-bottom">
        <div className="xp-paint-palette">
          <div className="xp-paint-current-colors">
            <div
              className="xp-color-swatch-fg"
              style={{ backgroundColor: color }}
            ></div>
            <div
              className="xp-color-swatch-bg"
              style={{ backgroundColor: bgColor }}
            ></div>
          </div>
          <div className="xp-paint-colors-grid">
            {COLORS.map((c) => (
              <button
                key={c}
                className="xp-color-btn"
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setBgColor(c)
                }}
                title={`Left-click: FG Color\nRight-click: BG Color`}
              />
            ))}
          </div>
        </div>
        <div className="xp-paint-statusbar">
          <div className="xp-paint-status-item">
            For Help, click Help Topics on the Help Menu.
          </div>
        </div>
      </div>
    </div>
  )
}
