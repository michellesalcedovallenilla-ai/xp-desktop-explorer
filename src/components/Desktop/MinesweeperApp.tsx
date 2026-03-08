import { useState, useCallback } from 'react'

const ROWS = 9
const COLS = 9
const MINES = 10

type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
}

function createBoard(): Cell[][] {
  const board: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0
    }))
  )
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (!board[r][c].mine) {
      board[r][c].mine = true
      placed++
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr,
            nc = c + dc
          if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            board[nr][nc].mine
          )
            count++
        }
      board[r][c].adjacent = count
    }
  }
  return board
}

const NUM_COLORS: Record<number, string> = {
  1: '#0000FF',
  2: '#008000',
  3: '#FF0000',
  4: '#000080',
  5: '#800000',
  6: '#008080',
  7: '#000000',
  8: '#808080'
}

export default function MinesweeperApp() {
  const [board, setBoard] = useState(() => createBoard())
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [timer, setTimerVal] = useState(0)
  const [started, setStarted] = useState(false)

  const flagCount = board.flat().filter((c) => c.flagged).length

  const reveal = useCallback((r: number, c: number, b: Cell[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
    if (b[r][c].revealed || b[r][c].flagged) return
    b[r][c].revealed = true
    if (b[r][c].adjacent === 0 && !b[r][c].mine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) reveal(r + dr, c + dc, b)
    }
  }, [])

  const handleClick = (r: number, c: number) => {
    if (gameOver || won || board[r][c].flagged || board[r][c].revealed) return
    if (!started) setStarted(true)
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
    if (newBoard[r][c].mine) {
      newBoard.forEach((row) =>
        row.forEach((cell) => {
          if (cell.mine) cell.revealed = true
        })
      )
      setBoard(newBoard)
      setGameOver(true)
      return
    }
    reveal(r, c, newBoard)
    const unrevealed = newBoard
      .flat()
      .filter((c) => !c.revealed && !c.mine).length
    if (unrevealed === 0) {
      setWon(true)
      newBoard.forEach((row) =>
        row.forEach((cell) => {
          if (cell.mine) cell.flagged = true
        })
      )
    }
    setBoard(newBoard)
  }

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (gameOver || won || board[r][c].revealed) return
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
    newBoard[r][c].flagged = !newBoard[r][c].flagged
    setBoard(newBoard)
  }

  const resetGame = () => {
    setBoard(createBoard())
    setGameOver(false)
    setWon(false)
    setTimerVal(0)
    setStarted(false)
  }

  return (
    <div className="xp-minesweeper">
      <div className="xp-mine-menu">
        <button className="xp-calc-menu-item" onClick={resetGame}>
          Game
        </button>
        <button className="xp-calc-menu-item">Help</button>
      </div>
      <div className="xp-mine-header">
        <div className="xp-mine-counter">
          {String(MINES - flagCount).padStart(3, '0')}
        </div>
        <button className="xp-mine-face" onClick={resetGame}>
          {gameOver ? '😵' : won ? '😎' : '🙂'}
        </button>
        <div className="xp-mine-counter">{String(timer).padStart(3, '0')}</div>
      </div>
      <div className="xp-mine-grid" onContextMenu={(e) => e.preventDefault()}>
        {board.map((row, r) => (
          <div key={r} className="xp-mine-row">
            {row.map((cell, c) => (
              <button
                key={c}
                className={`xp-mine-cell ${cell.revealed ? 'revealed' : ''} ${cell.revealed && cell.mine ? 'mine-hit' : ''}`}
                onClick={() => handleClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
              >
                {cell.revealed && cell.mine && '💣'}
                {cell.revealed && !cell.mine && cell.adjacent > 0 && (
                  <span
                    style={{
                      color: NUM_COLORS[cell.adjacent] || '#000',
                      fontWeight: 700
                    }}
                  >
                    {cell.adjacent}
                  </span>
                )}
                {!cell.revealed && cell.flagged && '🚩'}
              </button>
            ))}
          </div>
        ))}
      </div>
      {(gameOver || won) && (
        <div className="xp-mine-status">
          {gameOver ? '💥 Game Over!' : '🎉 You Win!'}
          <button className="xp-btn" onClick={resetGame}>
            New Game
          </button>
        </div>
      )}
    </div>
  )
}
