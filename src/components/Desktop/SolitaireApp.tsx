import { useState, useEffect } from 'react'

const SUITS = ['♠', '♥', '♦', '♣'] as const
const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K'
] as const

interface Card {
  suit: (typeof SUITS)[number]
  rank: (typeof RANKS)[number]
  faceUp: boolean
}

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS)
    for (const rank of RANKS) deck.push({ suit, rank, faceUp: false })
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function isRed(card: Card) {
  return card.suit === '♥' || card.suit === '♦'
}
function rankValue(rank: string): number {
  return RANKS.indexOf(rank as any)
}

interface GameState {
  tableau: Card[][]
  foundations: Card[][]
  stock: Card[]
  waste: Card[]
}

function initGame(): GameState {
  const deck = createDeck()
  const tableau: Card[][] = []
  let idx = 0
  for (let col = 0; col < 7; col++) {
    tableau[col] = []
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx++] }
      if (row === col) card.faceUp = true
      tableau[col].push(card)
    }
  }
  const stock = deck.slice(idx).map((c) => ({ ...c, faceUp: false }))
  return { tableau, foundations: [[], [], [], []], stock, waste: [] }
}

export default function SolitaireApp() {
  const [game, setGame] = useState<GameState>(initGame)
  const [selected, setSelected] = useState<{
    source: string
    colIdx?: number
    cardIdx?: number
  } | null>(null)

  const handleDrawStock = () => {
    setGame((prev) => {
      const stock = [...prev.stock]
      const waste = [...prev.waste]
      if (stock.length === 0) {
        return {
          ...prev,
          stock: waste.reverse().map((c) => ({ ...c, faceUp: false })),
          waste: []
        }
      }
      const card = stock.pop()!
      card.faceUp = true
      waste.push(card)
      return { ...prev, stock, waste }
    })
    setSelected(null)
  }

  const canPlaceOnTableau = (card: Card, target: Card[]): boolean => {
    if (target.length === 0) return card.rank === 'K'
    const topCard = target[target.length - 1]
    if (!topCard.faceUp) return false
    return (
      isRed(card) !== isRed(topCard) &&
      rankValue(card.rank) === rankValue(topCard.rank) - 1
    )
  }

  const canPlaceOnFoundation = (card: Card, foundation: Card[]): boolean => {
    if (foundation.length === 0) return card.rank === 'A'
    const topCard = foundation[foundation.length - 1]
    return (
      card.suit === topCard.suit &&
      rankValue(card.rank) === rankValue(topCard.rank) + 1
    )
  }

  const handleTabClick = (colIdx: number, cardIdx: number) => {
    const col = game.tableau[colIdx]
    const card = col[cardIdx]
    if (!card.faceUp) {
      if (cardIdx === col.length - 1) {
        setGame((prev) => {
          const tableau = prev.tableau.map((c) => [...c])
          tableau[colIdx][cardIdx] = {
            ...tableau[colIdx][cardIdx],
            faceUp: true
          }
          return { ...prev, tableau }
        })
      }
      return
    }

    if (selected) {
      // Try to place
      if (selected.source === 'waste') {
        const card = game.waste[game.waste.length - 1]
        if (canPlaceOnTableau(card, col)) {
          setGame((prev) => {
            const waste = [...prev.waste]
            waste.pop()
            const tableau = prev.tableau.map((c) => [...c])
            tableau[colIdx].push({ ...card })
            return { ...prev, waste, tableau }
          })
        }
      } else if (
        selected.source === 'tableau' &&
        selected.colIdx !== undefined &&
        selected.cardIdx !== undefined
      ) {
        const srcCol = game.tableau[selected.colIdx]
        const movingCards = srcCol.slice(selected.cardIdx)
        if (movingCards.length > 0 && canPlaceOnTableau(movingCards[0], col)) {
          setGame((prev) => {
            const tableau = prev.tableau.map((c) => [...c])
            tableau[selected.colIdx!] = tableau[selected.colIdx!].slice(
              0,
              selected.cardIdx!
            )
            tableau[colIdx] = [...tableau[colIdx], ...movingCards]
            // Flip top card
            const src = tableau[selected.colIdx!]
            if (src.length > 0 && !src[src.length - 1].faceUp) {
              src[src.length - 1] = { ...src[src.length - 1], faceUp: true }
            }
            return { ...prev, tableau }
          })
        }
      }
      setSelected(null)
    } else {
      setSelected({ source: 'tableau', colIdx, cardIdx })
    }
  }

  const handleWasteClick = () => {
    if (game.waste.length === 0) return
    if (selected?.source === 'waste') {
      setSelected(null)
      return
    }
    setSelected({ source: 'waste' })
  }

  const handleFoundationClick = (fIdx: number) => {
    if (!selected) return
    let card: Card | undefined
    if (selected.source === 'waste') card = game.waste[game.waste.length - 1]
    else if (selected.source === 'tableau' && selected.colIdx !== undefined) {
      const col = game.tableau[selected.colIdx]
      if (selected.cardIdx === col.length - 1) card = col[col.length - 1]
    }
    if (!card || !canPlaceOnFoundation(card, game.foundations[fIdx])) {
      setSelected(null)
      return
    }

    setGame((prev) => {
      const foundations = prev.foundations.map((f) => [...f])
      foundations[fIdx].push({ ...card! })
      if (selected.source === 'waste') {
        const waste = [...prev.waste]
        waste.pop()
        return { ...prev, foundations, waste }
      } else {
        const tableau = prev.tableau.map((c) => [...c])
        tableau[selected.colIdx!].pop()
        const src = tableau[selected.colIdx!]
        if (src.length > 0 && !src[src.length - 1].faceUp) {
          src[src.length - 1] = { ...src[src.length - 1], faceUp: true }
        }
        return { ...prev, foundations, tableau }
      }
    })
    setSelected(null)
  }

  const hasWon = game.foundations.every((f) => f.length === 13)

  return (
    <div className="xp-solitaire">
      <div className="xp-mine-menu">
        <button className="xp-calc-menu-item" onClick={() => setGame(initGame)}>
          Game
        </button>
        <button className="xp-calc-menu-item">Help</button>
      </div>
      <div className="xp-sol-top">
        {/* Stock and Waste */}
        <div className="xp-sol-stock-area">
          <button
            className="xp-sol-card xp-sol-stock"
            onClick={handleDrawStock}
          >
            {game.stock.length > 0 ? '🂠' : '↺'}
          </button>
          <div
            className={`xp-sol-card ${game.waste.length > 0 ? '' : 'empty'} ${selected?.source === 'waste' ? 'selected' : ''}`}
            onClick={handleWasteClick}
          >
            {game.waste.length > 0 &&
              renderCard(game.waste[game.waste.length - 1])}
          </div>
        </div>
        {/* Foundations */}
        <div className="xp-sol-foundations">
          {game.foundations.map((f, i) => (
            <button
              key={i}
              className={`xp-sol-card xp-sol-foundation ${f.length === 0 ? 'empty' : ''}`}
              onClick={() => handleFoundationClick(i)}
            >
              {f.length > 0 ? renderCard(f[f.length - 1]) : SUITS[i]}
            </button>
          ))}
        </div>
      </div>
      {/* Tableau */}
      <div className="xp-sol-tableau">
        {game.tableau.map((col, colIdx) => (
          <div key={colIdx} className="xp-sol-column">
            {col.length === 0 && (
              <div
                className="xp-sol-card empty"
                onClick={() => handleTabClick(colIdx, 0)}
              />
            )}
            {col.map((card, cardIdx) => (
              <div
                key={cardIdx}
                className={`xp-sol-card ${card.faceUp ? '' : 'face-down'} ${selected?.source === 'tableau' && selected.colIdx === colIdx && selected.cardIdx !== undefined && cardIdx >= selected.cardIdx ? 'selected' : ''}`}
                style={{ top: cardIdx * 20 }}
                onClick={() => handleTabClick(colIdx, cardIdx)}
              >
                {card.faceUp ? renderCard(card) : '🂠'}
              </div>
            ))}
          </div>
        ))}
      </div>
      {hasWon && (
        <div className="xp-mine-status">
          🎉 You Win!{' '}
          <button className="xp-btn" onClick={() => setGame(initGame)}>
            New Game
          </button>
        </div>
      )}
    </div>
  )
}

function renderCard(card: Card) {
  const red = card.suit === '♥' || card.suit === '♦'
  return (
    <span style={{ color: red ? '#CC0000' : '#000' }}>
      {card.rank}
      {card.suit}
    </span>
  )
}
