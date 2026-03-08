import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAudioStore } from '../../store/useAudioStore'

interface GuestbookMessage {
  id: string
  nickname: string
  status: string
  message: string
  created_at: string
}

// MSN emoticon map
const MSN_EMOTICONS: Record<string, string> = {
  ':)': '😊', ':D': '😄', ';)': '😉', ':(': '😢',
  ':O': '😲', ':P': '😛', '(B)': '😎', '(Y)': '👍',
  '(N)': '👎', '(H)': '😎', ':S': '😖', '(A)': '😇',
  '(L)': '❤️', '(U)': '💔', '(M)': '📧', '(*)': '⭐',
  '(F)': '🌹', '(W)': '🥀', '(K)': '💋', '(G)': '🎁',
  '(^)': '🎂', '(P)': '📷', '(~)': '🎬', '(@)': '🐱',
  '(&)': '🐶', '(8)': '🎵', ':@': '😡', '8)': '🤓',
}

const MSN_STATUSES = [
  { label: 'Online', color: '#00b300', icon: '🟢' },
  { label: 'Away', color: '#ffa500', icon: '🟡' },
  { label: 'Busy', color: '#cc0000', icon: '🔴' },
  { label: 'BRB', color: '#ffa500', icon: '🟡' },
  { label: 'On the Phone', color: '#cc0000', icon: '🔴' },
  { label: 'Out to Lunch', color: '#ffa500', icon: '🟡' },
]

const MSN_AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👦', '🐱', '🐶', '🦊', '🐸', '🐰', '🐼']

// Winks / animated messages
const MSN_WINKS = [
  { label: '💃 Bailando', text: '~*~💃 ¡Bailando! 💃~*~' },
  { label: '🎉 Fiesta', text: '~*~🎉🥳 ¡¡FIESTA!! 🥳🎉~*~' },
  { label: '😘 Besito', text: '~*~😘💋 ¡Besito! 💋😘~*~' },
  { label: '🔥 En llamas', text: '~*~🔥🔥🔥 ¡EN LLAMAS! 🔥🔥🔥~*~' },
]

function replaceEmoticons(text: string): string {
  let result = text
  const sorted = Object.entries(MSN_EMOTICONS).sort((a, b) => b[0].length - a[0].length)
  for (const [code, emoji] of sorted) {
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(escaped, 'g'), emoji)
  }
  return result
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

let lastPostTime = 0
let lastNudgeTime = 0

export default function MSNMessenger() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [nickname, setNickname] = useState('')
  const [status, setStatus] = useState('Online')
  const [messageText, setMessageText] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState('')
  const [showEmoticons, setShowEmoticons] = useState(false)
  const [showWinks, setShowWinks] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { playError } = useAudioStore()

  // Load messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('guestbook_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(200)
      if (data) setMessages(data as GuestbookMessage[])
    }
    fetchMessages()

    const channel = supabase
      .channel('guestbook')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook_messages' }, (payload) => {
        const newMsg = payload.new as GuestbookMessage
        setMessages(prev => [...prev, newMsg])
        // If it's a nudge, shake!
        if (newMsg.message === '🫨 ¡¡ZUMBIDO!! 🫨') {
          triggerNudgeEffect()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Typing indicator
  useEffect(() => {
    if (messageText.length > 0) {
      setIsTyping(true)
    } else {
      setIsTyping(false)
    }
  }, [messageText])

  const triggerNudgeEffect = useCallback(() => {
    setIsShaking(true)
    playError()
    setTimeout(() => setIsShaking(false), 600)
  }, [playError])

  const sendNudge = useCallback(async () => {
    const trimNick = nickname.trim()
    if (!trimNick) { setError('¡Escribe tu nickname primero!'); return }

    if (Date.now() - lastNudgeTime < 8000) {
      setError('¡Espera para enviar otro zumbido!')
      return
    }

    // Local shake immediately
    triggerNudgeEffect()

    const { error: insertError } = await supabase
      .from('guestbook_messages')
      .insert({
        nickname: trimNick,
        status: status,
        message: '🫨 ¡¡ZUMBIDO!! 🫨',
      })

    if (insertError) {
      setError('Error al enviar zumbido')
    } else {
      lastNudgeTime = Date.now()
    }
  }, [nickname, status, triggerNudgeEffect])

  const handlePost = useCallback(async () => {
    const trimNick = nickname.trim()
    const trimMsg = messageText.trim()

    if (!trimNick) { setError('¡Escribe tu nickname!'); return }
    if (!trimMsg) { setError('¡Escribe un mensaje!'); return }
    if (trimNick.length > 30) { setError('Nickname muy largo (máx 30)'); return }
    if (trimMsg.length > 500) { setError('Mensaje muy largo (máx 500)'); return }

    if (Date.now() - lastPostTime < 5000) {
      setError('¡Más lento! Espera unos segundos.')
      return
    }

    setIsPosting(true)
    setError('')

    const { error: insertError } = await supabase
      .from('guestbook_messages')
      .insert({
        nickname: trimNick,
        status: status,
        message: trimMsg,
      })

    if (insertError) {
      setError('Error al enviar. ¡Intenta de nuevo!')
    } else {
      lastPostTime = Date.now()
      setMessageText('')
    }
    setIsPosting(false)
  }, [nickname, messageText, status])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePost()
    }
  }

  const insertEmoticon = (code: string) => {
    setMessageText(prev => prev + code)
    setShowEmoticons(false)
  }

  const sendWink = (winkText: string) => {
    setMessageText(winkText)
    setShowWinks(false)
  }

  const statusObj = MSN_STATUSES.find(s => s.label === status) || MSN_STATUSES[0]

  const isNudgeMessage = (msg: string) => msg === '🫨 ¡¡ZUMBIDO!! 🫨'

  return (
    <div className={`msn-messenger ${isShaking ? 'msn-shake' : ''}`} ref={containerRef}>
      {/* MSN Menu Bar */}
      <div className="msn-menubar">
        <button className="msn-menu-item">Archivo</button>
        <button className="msn-menu-item">Editar</button>
        <button className="msn-menu-item">Acciones</button>
        <button className="msn-menu-item">Herramientas</button>
        <button className="msn-menu-item">Ayuda</button>
      </div>

      {/* MSN Toolbar */}
      <div className="msn-toolbar">
        <div className="msn-toolbar-btn" onClick={sendNudge} title="¡Enviar zumbido!">🫨 Zumbido</div>
        <div className="msn-toolbar-btn" onClick={() => setShowWinks(!showWinks)} title="Enviar wink">🎭 Winks</div>
        <div className="msn-toolbar-btn">📁 Archivos</div>
        <div className="msn-toolbar-btn">📷 Cámara</div>
        <div className="msn-toolbar-btn">🎮 Juegos</div>
        <div className="msn-msn-logo">
          <span style={{ color: '#f77b00', fontWeight: 'bold', fontStyle: 'italic', fontSize: '13px' }}>msn</span>
        </div>
      </div>

      {/* Winks dropdown */}
      {showWinks && (
        <div className="msn-winks-picker">
          {MSN_WINKS.map((w, i) => (
            <button key={i} className="msn-wink-btn" onClick={() => sendWink(w.text)}>
              {w.label}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="msn-header">
        <span className="msn-header-to">Para: &lt; Guestbook &gt;</span>
      </div>

      {/* Chat Area */}
      <div className="msn-chat-area" ref={chatRef}>
        <div className="msn-system-msg">
          <span className="msn-system-text">💬 ¡Bienvenido al Guestbook! Deja un mensaje para futuros visitantes ✨</span>
        </div>

        {messages.map((msg) => {
          const avatar = MSN_AVATARS[msg.nickname.charCodeAt(0) % MSN_AVATARS.length]
          const msgStatus = MSN_STATUSES.find(s => s.label === msg.status)
          const nudge = isNudgeMessage(msg.message)

          return (
            <div key={msg.id} className={`msn-message ${nudge ? 'msn-nudge-msg' : ''}`}>
              <div className="msn-msg-header">
                <span className="msn-msg-avatar">{avatar}</span>
                <span className="msn-msg-nick" style={{ fontWeight: 'bold' }}>
                  {msg.nickname}
                </span>
                {!nudge && msg.status && (
                  <span className="msn-msg-status" style={{ color: msgStatus?.color || '#666' }}>
                    {msgStatus?.icon || '🟢'} {msg.status}
                  </span>
                )}
                <span className="msn-msg-time">{timeAgo(msg.created_at)}</span>
              </div>
              <div className={`msn-msg-body ${nudge ? 'msn-nudge-body' : ''}`}>
                {nudge ? (
                  <span className="msn-nudge-text">
                    {msg.nickname} te ha enviado un zumbido 🫨📳
                  </span>
                ) : (
                  <>
                    <span className="msn-msg-dice">{msg.nickname} dice:</span>
                    <br />
                    {replaceEmoticons(msg.message)}
                  </>
                )}
              </div>
            </div>
          )
        })}

        {messages.length === 0 && (
          <div className="msn-system-msg">
            <span className="msn-system-text">No hay mensajes aún. ¡Sé el primero! 🎉</span>
          </div>
        )}
      </div>

      {/* Typing indicator */}
      {isTyping && nickname.trim() && (
        <div className="msn-typing-indicator">
          ✏️ {nickname.trim()} está escribiendo...
        </div>
      )}

      {/* Input Area */}
      <div className="msn-input-area">
        <div className="msn-emoticon-bar">
          <button className="msn-emo-toggle" onClick={() => { setShowEmoticons(!showEmoticons); setShowWinks(false) }}>
            😊 Emoticons
          </button>
          <button className="msn-emo-toggle msn-nudge-btn" onClick={sendNudge} title="¡Zumbido!">
            🫨
          </button>
          <select
            className="msn-status-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {MSN_STATUSES.map(s => (
              <option key={s.label} value={s.label}>{s.icon} {s.label}</option>
            ))}
          </select>
        </div>

        {showEmoticons && (
          <div className="msn-emoticon-picker">
            {Object.entries(MSN_EMOTICONS).slice(0, 20).map(([code, emoji]) => (
              <button key={code} className="msn-emo-btn" onClick={() => insertEmoticon(code)} title={code}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="msn-compose">
          <input
            className="msn-nick-input"
            placeholder="Tu nickname..."
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={30}
          />
          <div className="msn-msg-compose">
            <textarea
              className="msn-msg-input"
              placeholder="Escribe un mensaje... (máx 500)"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              rows={2}
            />
            <div className="msn-compose-actions">
              <button
                className="msn-send-btn"
                onClick={handlePost}
                disabled={isPosting}
              >
                {isPosting ? '...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="msn-error">{error}</div>}
        <div className="msn-char-count">{messageText.length}/500</div>
      </div>

      {/* Status Bar */}
      <div className="msn-statusbar">
        <span>{statusObj.icon} {status}</span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.7 }}>
          {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
