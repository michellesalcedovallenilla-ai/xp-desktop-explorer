import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DraggableWidget from './DraggableWidget'

export default function CalendarWidget() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const isToday = (d: number) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  return (
    <DraggableWidget
      id="calendar"
      title="Date and Time"
      className="xp-calendar-widget"
    >
      <div className="xp-cal-header">
        <button className="xp-cal-nav" onClick={prevMonth}>
          <ChevronLeft size={14} />
        </button>
        <span className="xp-cal-month">{monthName}</span>
        <button className="xp-cal-nav" onClick={nextMonth}>
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="xp-cal-days-header">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="xp-cal-day-name">
            {d}
          </span>
        ))}
      </div>
      <div className="xp-cal-grid">
        {days.map((d, i) => (
          <button
            key={i}
            className={`xp-cal-day ${d === null ? 'empty' : ''} ${d && isToday(d) ? 'today' : ''}`}
            disabled={d === null}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="xp-cal-today-bar">
        Today:{' '}
        {today.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </DraggableWidget>
  )
}
