import { useState, useEffect } from 'react'

type Cell = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const ROWS = 9
const COLS = 9
const MINES = 10

export default function MinesweeperViewer() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [mineCount, setMineCount] = useState(MINES)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    initGame()
  }, [])

  useEffect(() => {
    let timer: number
    if (isPlaying && !gameOver && !gameWon) {
      timer = window.setInterval(() => setTime((t) => t + 1), 1000)
    }
    return () => clearInterval(timer)
  }, [isPlaying, gameOver, gameWon])

  const initGame = () => {
    const newGrid: Cell[][] = Array(ROWS)
      .fill(null)
      .map(() =>
        Array(COLS)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0
          }))
      )

    let minesPlaced = 0
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS)
      const c = Math.floor(Math.random() * COLS)
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true
        minesPlaced++
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (
                r + dr >= 0 &&
                r + dr < ROWS &&
                c + dc >= 0 &&
                c + dc < COLS
              ) {
                if (newGrid[r + dr][c + dc].isMine) count++
              }
            }
          }
          newGrid[r][c].neighborMines = count
        }
      }
    }

    setGrid(newGrid)
    setGameOver(false)
    setGameWon(false)
    setMineCount(MINES)
    setTime(0)
    setIsPlaying(false)
  }

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || gameWon || grid[r][c].isFlagged || grid[r][c].isRevealed)
      return

    if (!isPlaying) setIsPlaying(true)

    const newGrid = [...grid]

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid[r][c].isRevealed = true
      setGrid(newGrid)
      setGameOver(true)
      return
    }

    revealCell(r, c, newGrid)
    setGrid(newGrid)
    checkWin(newGrid)
  }

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (gameOver || gameWon || grid[r][c].isRevealed) return

    if (!isPlaying) setIsPlaying(true)

    const newGrid = [...grid]
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged
    setGrid(newGrid)
    setMineCount((m) => (newGrid[r][c].isFlagged ? m - 1 : m + 1))
  }

  const revealCell = (r: number, c: number, newGrid: Cell[][]) => {
    if (
      r < 0 ||
      r >= ROWS ||
      c < 0 ||
      c >= COLS ||
      newGrid[r][c].isRevealed ||
      newGrid[r][c].isFlagged
    )
      return

    newGrid[r][c].isRevealed = true

    if (newGrid[r][c].neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(r + dr, c + dc, newGrid)
        }
      }
    }
  }

  const checkWin = (currentGrid: Cell[][]) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!currentGrid[r][c].isMine && !currentGrid[r][c].isRevealed) {
          return
        }
      }
    }
    setGameWon(true)
  }

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return '🚩'
    if (!cell.isRevealed) return ''
    if (cell.isMine) return '💣'
    if (cell.neighborMines > 0) return cell.neighborMines
    return ''
  }

  const getCellColor = (mines: number) => {
    const colors = [
      '#0000FF',
      '#008000',
      '#FF0000',
      '#000080',
      '#800000',
      '#008080',
      '#000000',
      '#808080'
    ]
    return colors[mines - 1] || '#000'
  }

  return (
    <div className="xp-minesweeper-app">
      <div className="xp-ms-menu">
        <button className="xp-ms-menu-item">Game</button>
        <button className="xp-ms-menu-item">Help</button>
      </div>

      <div className="xp-ms-board-container">
        <div className="xp-ms-board">
          <div className="xp-ms-header">
            <div className="xp-ms-counter">
              {mineCount.toString().padStart(3, '0')}
            </div>
            <button className="xp-ms-face" onClick={initGame}>
              {gameOver ? '😵' : gameWon ? '😎' : '🙂'}
            </button>
            <div className="xp-ms-counter">
              {time.toString().padStart(3, '0')}
            </div>
          </div>

          <div className="xp-ms-grid">
            {grid.map((row, r) => (
              <div key={r} className="xp-ms-row">
                {row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    className={`xp-ms-cell ${cell.isRevealed ? 'revealed' : ''} ${gameOver && cell.isMine && !cell.isFlagged ? 'mine' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleRightClick(e, r, c)}
                    style={{
                      color:
                        cell.isRevealed && cell.neighborMines > 0
                          ? getCellColor(cell.neighborMines)
                          : 'inherit'
                    }}
                  >
                    {getCellContent(cell)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
