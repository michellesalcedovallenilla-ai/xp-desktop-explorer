import { useClock } from '../../hooks/useClock'
import DraggableWidget from './DraggableWidget'

export default function ClockWidget() {
  const time = useClock()
  const seconds = time.getSeconds()
  const minutes = time.getMinutes()
  const hours = time.getHours() % 12
  const secAngle = seconds * 6
  const minAngle = minutes * 6 + seconds * 0.1
  const hrAngle = hours * 30 + minutes * 0.5

  return (
    <DraggableWidget id="clock" title="Clock" className="xp-clock-widget">
      <div className="xp-clock-body">
        <svg
          className="xp-clock-svg"
          viewBox="0 0 200 200"
          width="150"
          height="150"
        >
          {/* Face */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="#F0F0F0"
            stroke="#808080"
            strokeWidth="2"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="white"
            stroke="#C0C0C0"
            strokeWidth="1"
          />
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = ((i * 30 - 90) * Math.PI) / 180
            return (
              <line
                key={i}
                x1={100 + Math.cos(angle) * 78}
                y1={100 + Math.sin(angle) * 78}
                x2={100 + Math.cos(angle) * 85}
                y2={100 + Math.sin(angle) * 85}
                stroke="#333"
                strokeWidth={i % 3 === 0 ? 3 : 1}
              />
            )
          })}
          {/* Numbers */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
            const angle = ((i * 30 - 90) * Math.PI) / 180
            return (
              <text
                key={n}
                x={100 + Math.cos(angle) * 68}
                y={100 + Math.sin(angle) * 68 + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#333"
              >
                {n}
              </text>
            )
          })}
          {/* Hour hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + Math.cos(((hrAngle - 90) * Math.PI) / 180) * 45}
            y2={100 + Math.sin(((hrAngle - 90) * Math.PI) / 180) * 45}
            stroke="#333"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + Math.cos(((minAngle - 90) * Math.PI) / 180) * 60}
            y2={100 + Math.sin(((minAngle - 90) * Math.PI) / 180) * 60}
            stroke="#333"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Second hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + Math.cos(((secAngle - 90) * Math.PI) / 180) * 65}
            y2={100 + Math.sin(((secAngle - 90) * Math.PI) / 180) * 65}
            stroke="#CC0000"
            strokeWidth="1"
          />
          <circle cx="100" cy="100" r="4" fill="#333" />
        </svg>
        <div className="xp-clock-digital">
          {time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>
    </DraggableWidget>
  )
}
