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

// Guiños - full-screen wink animations like original MSN
const MSN_GUINOS = [
  { id: 'kiss', label: '💋 Besito', emoji: '💋', animation: 'guino-kiss', color: '#ff1a6c' },
  { id: 'heart', label: '❤️ Corazón', emoji: '❤️', animation: 'guino-heart', color: '#ff0040' },
  { id: 'fist', label: '👊 Puñetazo', emoji: '👊', animation: 'guino-punch', color: '#ffaa00' },
  { id: 'silly', label: '🤪 Cara loca', emoji: '🤪', animation: 'guino-silly', color: '#00cc66' },
  { id: 'fire', label: '🔥 Fuego', emoji: '🔥', animation: 'guino-fire', color: '#ff4400' },
  { id: 'party', label: '🎉 Fiesta', emoji: '🎉', animation: 'guino-party', color: '#9933ff' },
  { id: 'star', label: '⭐ Estrella', emoji: '⭐', animation: 'guino-star', color: '#ffcc00' },
  { id: 'tongue', label: '😝 Lengua', emoji: '😝', animation: 'guino-silly', color: '#ff6699' },
  { id: 'crying', label: '😭 Llorando', emoji: '😭', animation: 'guino-heart', color: '#3399ff' },
  { id: 'devil', label: '😈 Diablito', emoji: '😈', animation: 'guino-fire', color: '#9900cc' },
  { id: 'angel', label: '😇 Angelito', emoji: '😇', animation: 'guino-star', color: '#66ccff' },
  { id: 'poop', label: '💩 Caquita', emoji: '💩', animation: 'guino-silly', color: '#996633' },
]

// Prefix to identify wink messages
const WINK_PREFIX = '🎭GUIÑO:'
const NUDGE_MSG = '🫨 ¡¡ZUMBIDO!! 🫨'

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

// Generate or retrieve device ID for one-comment-per-device enforcement
function getDeviceId(): string {
  const stored = localStorage.getItem('msn_device_id')
  if (stored) return stored
  const newId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  localStorage.setItem('msn_device_id', newId)
  return newId
}

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
  const [activeGuino, setActiveGuino] = useState<typeof MSN_GUINOS[0] | null>(null)
  const [hasPosted, setHasPosted] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const msgInputRef = useRef<HTMLTextAreaElement>(null)
  const { playError } = useAudioStore()
  const deviceId = getDeviceId()

  const triggerGuino = useCallback((guinoId: string) => {
    const guino = MSN_GUINOS.find(g => g.id === guinoId)
    if (guino) {
      setActiveGuino(guino)
      setTimeout(() => setActiveGuino(null), 3000)
    }
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('guestbook_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(200)
      if (data) {
        setMessages(data as GuestbookMessage[])
        // Check if this device has already posted
        const alreadyPosted = data.some((msg: any) => msg.device_id === deviceId)
        setHasPosted(alreadyPosted)
      }
    }
    fetchMessages()

    const channel = supabase
      .channel('guestbook')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook_messages' }, (payload) => {
        const newMsg = payload.new as GuestbookMessage
        setMessages(prev => [...prev, newMsg])
        if (newMsg.message === NUDGE_MSG) {
          triggerNudgeEffect()
        }
        // Check for wink messages
        if (newMsg.message.startsWith(WINK_PREFIX)) {
          const guinoId = newMsg.message.replace(WINK_PREFIX, '')
          triggerGuino(guinoId)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    setIsTyping(messageText.length > 0)
  }, [messageText])

  const triggerNudgeEffect = useCallback(() => {
    setIsShaking(true)
    playError()
    setTimeout(() => setIsShaking(false), 600)
  }, [playError])

  const sendNudge = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const trimNick = nickname.trim()
    if (!trimNick) { setError('¡Escribe tu nickname primero!'); return }
    if (hasPosted) { setError('¡Ya dejaste tu mensaje! Solo puedes comentar una vez.'); return }
    if (Date.now() - lastNudgeTime < 8000) {
      setError('¡Espera para enviar otro zumbido!')
      return
    }
    triggerNudgeEffect()
    const { error: insertError } = await supabase
      .from('guestbook_messages')
      .insert({ nickname: trimNick, status, message: NUDGE_MSG, device_id: deviceId })
    if (insertError) {
      if (insertError.code === '23505') setError('¡Ya dejaste tu mensaje! Solo puedes comentar una vez.')
      else setError('Error al enviar zumbido')
    } else { 
      lastNudgeTime = Date.now()
      setError('')
      setHasPosted(true)
    }
  }, [nickname, status, triggerNudgeEffect, hasPosted, deviceId])

  const sendGuino = useCallback(async (guino: typeof MSN_GUINOS[0]) => {
    const trimNick = nickname.trim()
    if (!trimNick) { setError('¡Escribe tu nickname primero!'); return }
    if (hasPosted) { setError('¡Ya dejaste tu mensaje! Solo puedes comentar una vez.'); return }
    if (Date.now() - lastPostTime < 5000) { setError('¡Más lento! Espera unos segundos.'); return }

    setShowWinks(false)
    triggerGuino(guino.id) // Show locally immediately

    const { error: insertError } = await supabase
      .from('guestbook_messages')
      .insert({ nickname: trimNick, status, message: WINK_PREFIX + guino.id, device_id: deviceId })
    if (insertError) {
      if (insertError.code === '23505') setError('¡Ya dejaste tu mensaje! Solo puedes comentar una vez.')
      else setError('Error al enviar guiño')
    } else { 
      lastPostTime = Date.now()
      setError('')
      setHasPosted(true)
    }
  }, [nickname, status, triggerGuino, hasPosted, deviceId])

  const handlePost = useCallback(async () => {
    const trimNick = nickname.trim()
    const trimMsg = messageText.trim()
    if (!trimNick) { setError('¡Escribe tu nickname!'); return }
    if (!trimMsg) { setError('¡Escribe un mensaje!'); return }
    if (trimNick.length > 30) { setError('Nickname muy largo (máx 30)'); return }
    if (trimMsg.length > 500) { setError('Mensaje muy largo (máx 500)'); return }
    if (Date.now() - lastPostTime < 5000) { setError('¡Más lento! Espera unos segundos.'); return }

    setIsPosting(true)
    setError('')
    const { error: insertError } = await supabase
      .from('guestbook_messages')
      .insert({ nickname: trimNick, status, message: trimMsg })
    if (insertError) setError('Error al enviar. ¡Intenta de nuevo!')
    else { lastPostTime = Date.now(); setMessageText('') }
    setIsPosting(false)
  }, [nickname, messageText, status])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost() }
  }

  const toggleEmoticons = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setShowEmoticons(prev => !prev); setShowWinks(false)
  }

  const toggleWinks = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setShowWinks(prev => !prev); setShowEmoticons(false)
  }

  const insertEmoticon = (code: string) => {
    setMessageText(prev => prev + code)
    setShowEmoticons(false)
    msgInputRef.current?.focus()
  }

  const statusObj = MSN_STATUSES.find(s => s.label === status) || MSN_STATUSES[0]
  const isNudgeMessage = (msg: string) => msg === NUDGE_MSG
  const isWinkMessage = (msg: string) => msg.startsWith(WINK_PREFIX)
  const getWinkGuino = (msg: string) => MSN_GUINOS.find(g => g.id === msg.replace(WINK_PREFIX, ''))

  return (
    <div className={`msn-messenger ${isShaking ? 'msn-shake' : ''}`}>
      {/* Menu Bar */}
      <div className="msn-menubar">
        <button className="msn-menu-item" type="button">File</button>
        <button className="msn-menu-item" type="button">Edit</button>
        <button className="msn-menu-item" type="button">Actions</button>
        <button className="msn-menu-item" type="button">Tools</button>
        <button className="msn-menu-item" type="button">Help</button>
      </div>

      {/* Toolbar */}
      <div className="msn-toolbar">
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">👤</span><span>Invite</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">📁</span><span>Send Files</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🎥</span><span>Video</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🔊</span><span>Voice</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🎲</span><span>Activities</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🃏</span><span>Games</span>
        </div>
        <div className="msn-msn-logo">
          <span style={{ color: '#f77b00', fontWeight: 'bold', fontStyle: 'italic', fontSize: '15px', letterSpacing: '-0.5px' }}>msn</span>
          <span style={{ color: '#f77b00', fontSize: '8px', position: 'relative', top: '-4px' }}>🦋</span>
        </div>
      </div>

      {/* Main area */}
      <div className="msn-main">
        <div className="msn-main-left">
          <div className="msn-header">
            <span className="msn-header-to">To: &lt; Guestbook &gt;</span>
          </div>

          {/* Chat + Guiño overlay */}
          <div className="msn-chat-wrapper">
            <div className="msn-chat-area" ref={chatRef}>
              <div className="msn-system-msg">
                <span className="msn-system-text">💬 Welcome to the Guestbook! Leave a message for future visitors ✨</span>
              </div>

              {messages.map((msg) => {
                const avatar = MSN_AVATARS[msg.nickname.charCodeAt(0) % MSN_AVATARS.length]
                const msgStatus = MSN_STATUSES.find(s => s.label === msg.status)
                const nudge = isNudgeMessage(msg.message)
                const wink = isWinkMessage(msg.message)
                const guinoData = wink ? getWinkGuino(msg.message) : null

                if (wink && guinoData) {
                  return (
                    <div key={msg.id} className="msn-message msn-wink-msg">
                      <div className="msn-msg-header">
                        <span className="msn-msg-avatar">{avatar}</span>
                        <span className="msn-msg-nick">{msg.nickname}</span>
                        <span className="msn-msg-time">{timeAgo(msg.created_at)}</span>
                      </div>
                      <div className="msn-msg-body msn-wink-msg-body">
                        <span className="msn-wink-inline">{guinoData.emoji}</span>
                        {msg.nickname} envió un guiño: <strong>{guinoData.label}</strong>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className={`msn-message ${nudge ? 'msn-nudge-msg' : ''}`}>
                    <div className="msn-msg-header">
                      <span className="msn-msg-avatar">{avatar}</span>
                      <span className="msn-msg-nick">{msg.nickname}</span>
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
                      ) : replaceEmoticons(msg.message)}
                    </div>
                  </div>
                )
              })}

              {messages.length === 0 && (
                <div className="msn-system-msg">
                  <span className="msn-system-text">No messages yet. Be the first! 🎉</span>
                </div>
              )}
            </div>

            {/* GUIÑO OVERLAY - full chat area takeover */}
            {activeGuino && (
              <div className="msn-guino-overlay" onClick={() => setActiveGuino(null)}>
                <div className={`msn-guino-animation ${activeGuino.animation}`}>
                  <span className="msn-guino-emoji">{activeGuino.emoji}</span>
                </div>
                <div className="msn-guino-label">{activeGuino.label}</div>
              </div>
            )}
          </div>

          {isTyping && nickname.trim() && (
            <div className="msn-typing-indicator">
              ✏️ {nickname.trim()} está escribiendo...
            </div>
          )}
        </div>

        <div className="msn-sidebar">
          <div className="msn-dp-box">
            <img src="/msn/dp-top.jpg" alt="Display Picture" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
          </div>
          <div className="msn-dp-box msn-dp-box-small">
            <img src="/msn/dp-bottom.jpg" alt="My Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Input section */}
      <div className="msn-input-section">
        <div className="msn-input-toolbar">
          <button type="button" className="msn-tool-btn msn-font-btn" title="Font">A</button>
          <button type="button" className={`msn-tool-btn ${showEmoticons ? 'msn-tool-active' : ''}`} onClick={toggleEmoticons} title="Emoticons">😊</button>
          <span className="msn-tool-dropdown">▾</span>
          <div className="msn-tool-separator" />
          <button type="button" className="msn-tool-btn msn-voice-clip-btn" title="Voice Clip">
            <span>🔊</span> <span>Voice Clip</span>
          </button>
          <div className="msn-tool-separator" />
          <button type="button" className={`msn-tool-btn ${showWinks ? 'msn-tool-active' : ''}`} onClick={toggleWinks} title="Guiños">😜</button>
          <button type="button" className="msn-tool-btn" title="Background">🖼️</button>
          <span className="msn-tool-dropdown">▾</span>
          <div className="msn-tool-separator" />
          <button type="button" className="msn-tool-btn" title="Gift">🎁</button>
          <button type="button" className="msn-tool-btn msn-nudge-tool" onClick={sendNudge} title="¡Enviar zumbido!">🫨</button>
        </div>

        {showEmoticons && (
          <div className="msn-emoticon-picker">
            {Object.entries(MSN_EMOTICONS).map(([code, emoji]) => (
              <button type="button" key={code} className="msn-emo-btn" onClick={() => insertEmoticon(code)} title={code}>{emoji}</button>
            ))}
          </div>
        )}

        {/* Guiños picker - MSN style grid */}
        {showWinks && (
          <div className="msn-guinos-picker">
            <div className="msn-guinos-title">Mis guiños</div>
            <div className="msn-guinos-grid">
              {MSN_GUINOS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  className="msn-guino-btn"
                  onClick={() => sendGuino(g)}
                  title={g.label}
                >
                  <span className="msn-guino-btn-emoji">{g.emoji}</span>
                  <span className="msn-guino-btn-label">{g.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="msn-compose-area">
          <div className="msn-compose-left">
            <div className="msn-nick-row">
              <span className="msn-nick-label">Nick:</span>
              <input className="msn-nick-input" placeholder="Tu nickname..." value={nickname} onChange={e => setNickname(e.target.value)} maxLength={30} />
              <select className="msn-status-select" value={status} onChange={e => setStatus(e.target.value)}>
                {MSN_STATUSES.map(s => (
                  <option key={s.label} value={s.label}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
            <textarea ref={msgInputRef} className="msn-msg-input" placeholder="Escribe un mensaje..." value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={handleKeyDown} maxLength={500} rows={2} />
          </div>
          <div className="msn-compose-right">
            <button type="button" className="msn-send-btn" onClick={handlePost} disabled={isPosting}>
              {isPosting ? '...' : 'Send'}
            </button>
          </div>
        </div>

        <div className="msn-compose-bottom">
          {error && <span className="msn-error">{error}</span>}
          <span className="msn-char-count">{messageText.length}/500</span>
          <span className="msn-nudge-icon" onClick={sendNudge} title="Zumbido" role="button">🫨</span>
          <span className="msn-font-icon">A</span>
        </div>
      </div>

      <div className="msn-statusbar">
        <span>{statusObj.icon} {status}</span>
        <span className="msn-statusbar-ad">Click for new Emoticons and Theme Packs</span>
        <span style={{ fontSize: '9px', opacity: 0.6 }}>{messages.length} msgs</span>
      </div>
    </div>
  )
}
