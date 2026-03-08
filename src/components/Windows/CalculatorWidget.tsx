import { useState } from 'react'
import DraggableWidget from './DraggableWidget'

export default function CalculatorWidget() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)

  const calculate = (a: number, b: number, operation: string) => {
    switch (operation) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '*':
        return a * b
      case '/':
        return b === 0 ? NaN : a / b
      default:
        return b
    }
  }

  const formatResult = (res: number) => {
    if (isNaN(res)) return 'Cannot divide by zero'
    return String(res)
  }

  const handleNumber = (n: string) => {
    if (display === 'Cannot divide by zero') {
      setDisplay(n === '.' ? '0.' : n)
      setFresh(false)
      return
    }

    if (fresh) {
      setDisplay(n === '.' ? '0.' : n)
      setFresh(false)
    } else {
      if (n === '.' && display.includes('.')) return
      setDisplay(display === '0' && n !== '.' ? n : display + n)
    }
  }

  const handleOp = (nextOp: string) => {
    if (display === 'Cannot divide by zero') return
    const current = parseFloat(display)

    if (prev !== null && op && !fresh) {
      const result = calculate(prev, current, op)
      setDisplay(formatResult(result))
      setPrev(isNaN(result) ? null : result)
    } else {
      setPrev(current)
    }
    setOp(nextOp)
    setFresh(true)
  }

  const handleEquals = () => {
    if (display === 'Cannot divide by zero' || prev === null || !op) return
    const current = parseFloat(display)
    const result = calculate(prev, current, op)
    setDisplay(formatResult(result))
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const handleClear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const handlePlusMinus = () => {
    if (display === 'Cannot divide by zero' || display === '0') return
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)
  }

  const handlePercent = () => {
    if (display === 'Cannot divide by zero') return
    const current = parseFloat(display)
    if (prev !== null && op) {
      // In Windows Calc, 50 + 10% = 55 (10% of 50 = 5)
      const percentVal = prev * (current / 100)
      setDisplay(String(percentVal))
    } else {
      setDisplay(String(current / 100))
    }
    setFresh(true)
  }

  const handleBackspace = () => {
    if (fresh || display === 'Cannot divide by zero') return
    if (display.length > 1) {
      let newVal = display.slice(0, -1)
      if (newVal === '-' || newVal === '-0') newVal = '0'
      setDisplay(newVal)
    } else {
      setDisplay('0')
    }
  }

  const handleSqrt = () => {
    if (display === 'Cannot divide by zero') return
    const val = parseFloat(display)
    setDisplay(val >= 0 ? String(Math.sqrt(val)) : 'Invalid input')
    setFresh(true)
  }

  const handleReciprocal = () => {
    if (display === 'Cannot divide by zero') return
    const val = parseFloat(display)
    setDisplay(val !== 0 ? String(1 / val) : 'Cannot divide by zero')
    setFresh(true)
  }

  return (
    <DraggableWidget
      id="calculator"
      title="Calculator"
      className="xp-calc-widget"
    >
      {/* XP Calculator menu */}
      <div className="xp-calc-menu">
        <button className="xp-calc-menu-item">Edit</button>
        <button className="xp-calc-menu-item">View</button>
        <button className="xp-calc-menu-item">Help</button>
      </div>
      <div className="xp-calc-display">
        <div className="xp-calc-display-text">{display}</div>
      </div>
      <div className="xp-calc-buttons">
        {/* Row 1: MC MR MS M+ */}
        <button className="xp-calc-btn xp-calc-mem" disabled>
          MC
        </button>
        <button className="xp-calc-btn xp-calc-mem" disabled>
          MR
        </button>
        <button className="xp-calc-btn xp-calc-mem" disabled>
          MS
        </button>
        <button className="xp-calc-btn xp-calc-mem" disabled>
          M+
        </button>
        <div style={{ width: 4 }} />
        <button className="xp-calc-btn xp-calc-fn" onClick={handleBackspace}>
          ⌫
        </button>
        <button
          className="xp-calc-btn xp-calc-fn"
          onClick={() => {
            setDisplay('0')
            setFresh(true)
          }}
        >
          CE
        </button>
        <button className="xp-calc-btn xp-calc-fn" onClick={handleClear}>
          C
        </button>
        {/* Row 2 */}
        <button className="xp-calc-btn" onClick={() => handleNumber('7')}>
          7
        </button>
        <button className="xp-calc-btn" onClick={() => handleNumber('8')}>
          8
        </button>
        <button className="xp-calc-btn" onClick={() => handleNumber('9')}>
          9
        </button>
        <button
          className="xp-calc-btn xp-calc-op"
          onClick={() => handleOp('/')}
        >
          /
        </button>
        <div style={{ width: 4 }} />
        <button className="xp-calc-btn xp-calc-fn" onClick={handleSqrt}>
          √
        </button>
        {/* Row 3 */}
        <button className="xp-calc-btn" onClick={() => handleNumber('4')}>
          4
        </button>
        <button className="xp-calc-btn" onClick={() => handleNumber('5')}>
          5
        </button>
        <button className="xp-calc-btn" onClick={() => handleNumber('6')}>
          6
        </button>
        <button
          className="xp-calc-btn xp-calc-op"
          onClick={() => handleOp('*')}
        >
          *
        </button>
        <div style={{ width: 4 }} />
        <button className="xp-calc-btn xp-calc-fn" onClick={handlePercent}>
          %
        </button>
        {/* Row 4 */}
        <button className="xp-calc-btn" onClick={() => handleNumber('1')}>
          1
        </button>
        <button className="xp-calc-btn" onClick={() => handleNumber('2')}>
          2
        </button>
        <button className="xp-calc-btn" onClick={() => handleNumber('3')}>
          3
        </button>
        <button
          className="xp-calc-btn xp-calc-op"
          onClick={() => handleOp('-')}
        >
          -
        </button>
        <div style={{ width: 4 }} />
        <button className="xp-calc-btn xp-calc-fn" onClick={handleReciprocal}>
          1/x
        </button>
        {/* Row 5 */}
        <button className="xp-calc-btn" onClick={() => handleNumber('0')}>
          0
        </button>
        <button className="xp-calc-btn" onClick={handlePlusMinus}>
          ±
        </button>
        <button className="xp-calc-btn" onClick={() => handleNumber('.')}>
          .
        </button>
        <button
          className="xp-calc-btn xp-calc-op"
          onClick={() => handleOp('+')}
        >
          +
        </button>
        <div style={{ width: 4 }} />
        <button className="xp-calc-btn xp-calc-eq" onClick={handleEquals}>
          =
        </button>
      </div>
    </DraggableWidget>
  )
}
