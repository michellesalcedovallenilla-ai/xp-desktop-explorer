import { useState, useEffect } from 'react'
import { Droplets, Wind } from 'lucide-react'
import DraggableWidget from './DraggableWidget'

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  location: string
  icon: string
  forecast: { day: string; high: number; low: number; icon: string }[]
}

const WEATHER_ICONS: Record<string, string> = {
  Clear: '☀️',
  Sunny: '☀️',
  'Partly Cloudy': '⛅',
  Cloudy: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Snow: '❄️',
  Thunderstorm: '⛈️',
  Fog: '🌫️',
  Mist: '🌫️',
  Overcast: '☁️'
}

function getWeatherIcon(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear', icon: '☀️' }
  if (code <= 3) return { condition: 'Partly Cloudy', icon: '⛅' }
  if (code <= 48) return { condition: 'Fog', icon: '🌫️' }
  if (code <= 57) return { condition: 'Drizzle', icon: '🌦️' }
  if (code <= 67) return { condition: 'Rain', icon: '🌧️' }
  if (code <= 77) return { condition: 'Snow', icon: '❄️' }
  if (code <= 82) return { condition: 'Rain', icon: '🌧️' }
  if (code <= 86) return { condition: 'Snow', icon: '❄️' }
  if (code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' }
  return { condition: 'Cloudy', icon: '☁️' }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            let locationName = `${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`
            try {
              const revRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
              )
              if (revRes.ok) {
                const revData = await revRes.json()
                locationName =
                  revData.address?.city ||
                  revData.address?.town ||
                  revData.address?.village ||
                  revData.display_name?.split(',')[0] ||
                  locationName
              }
            } catch {
              /* use coords as fallback */
            }

            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=5`
            )
            const data = await res.json()
            const current = data.current
            const { condition, icon } = getWeatherIcon(current.weather_code)

            setWeather({
              temp: Math.round(current.temperature_2m),
              condition,
              humidity: current.relative_humidity_2m,
              windSpeed: Math.round(current.wind_speed_10m),
              location: locationName,
              icon,
              forecast: data.daily.time.map((t: string, i: number) => {
                const d = new Date(t + 'T12:00:00')
                const wi = getWeatherIcon(data.daily.weather_code[i])
                return {
                  day: DAYS[d.getDay()],
                  high: Math.round(data.daily.temperature_2m_max[i]),
                  low: Math.round(data.daily.temperature_2m_min[i]),
                  icon: wi.icon
                }
              })
            })
            setLoading(false)
          } catch (e) {
            setError('Weather data unavailable')
            setLoading(false)
          }
        },
        (err) => {
          setError('📍 Location access needed for weather. Please allow location in your browser.')
          setLoading(false)
        },
        { timeout: 10000 }
      )
    } else {
      setError('Geolocation not supported')
      setLoading(false)
    }
  }, [])

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ padding: 16, textAlign: 'center', color: '#666', fontSize: 11 }}>
          Loading weather... 🌤️
        </div>
      )
    }

    if (error) {
      return (
        <div style={{ padding: 16, textAlign: 'center', color: '#666', fontSize: 11 }}>
          {error}
        </div>
      )
    }

    if (!weather) return null

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })

    return (
      <>
        <div className="xp-weather-current">
          <div className="xp-weather-icon" style={{ fontSize: 36 }}>
            {weather.icon}
          </div>
          <div className="xp-weather-info">
            <div className="xp-weather-temp">{weather.temp}°F</div>
            <div className="xp-weather-cond">{weather.condition}</div>
            <div className="xp-weather-loc">{weather.location}</div>
            <div className="xp-weather-date">{dateStr}</div>
          </div>
        </div>
        <div className="xp-weather-details">
          <div className="xp-weather-detail">
            <Droplets size={10} /> Humidity: {weather.humidity}%
          </div>
          <div className="xp-weather-detail">
            <Wind size={10} /> Wind: {weather.windSpeed} mph
          </div>
        </div>
        <div className="xp-weather-forecast">
          {weather.forecast.map((day) => (
            <div key={day.day} className="xp-fc-day">
              <span className="xp-fc-name">{day.day}</span>
              <span style={{ fontSize: 16 }}>{day.icon}</span>
              <span className="xp-fc-temps">
                {day.high}°/{day.low}°
              </span>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <DraggableWidget id="weather" title="Weather" className="xp-weather-widget">
      {renderContent()}
    </DraggableWidget>
  )
}
