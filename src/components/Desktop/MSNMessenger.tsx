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

const MSN_WINKS = [
  { label: '💃 Bailando', text: '~*~💃 ¡Bailando! 💃~*~' },
  { label: '🎉 Fiesta', text: '~*~🎉🥳 ¡¡FIESTA!! 🥳🎉~*~' },
  { label: '😘 Besito', text: '~*~😘💋 ¡Besito! 💋😘~*~' },
  { label: '🔥 En llamas', text: '~*~🔥🔥🔥 ¡EN LLAMAS! 🔥🔥🔥~*~' },
  { label: '🌈 Arcoíris', text: '~*~🌈✨ ¡ARCOÍRIS! ✨🌈~*~' },
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
  const msgInputRef = useRef<HTMLTextAreaElement>(null)
  const { playError } = useAudioStore()

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
        if (newMsg.message === '🫨 ¡¡ZUMBIDO!! 🫨') {
          triggerNudgeEffect()
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
    if (Date.now() - lastNudgeTime < 8000) {
      setError('¡Espera para enviar otro zumbido!')
      return
    }
    triggerNudgeEffect()
    const { error: insertError } = await supabase
      .from('guestbook_messages')
      .insert({ nickname: trimNick, status, message: '🫨 ¡¡ZUMBIDO!! 🫨' })
    if (insertError) setError('Error al enviar zumbido')
    else { lastNudgeTime = Date.now(); setError('') }
  }, [nickname, status, triggerNudgeEffect])

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
    e.preventDefault()
    e.stopPropagation()
    setShowEmoticons(prev => !prev)
    setShowWinks(false)
  }

  const toggleWinks = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowWinks(prev => !prev)
    setShowEmoticons(false)
  }

  const insertEmoticon = (code: string) => {
    setMessageText(prev => prev + code)
    setShowEmoticons(false)
    msgInputRef.current?.focus()
  }

  const sendWink = (winkText: string) => {
    setMessageText(winkText)
    setShowWinks(false)
    msgInputRef.current?.focus()
  }

  const statusObj = MSN_STATUSES.find(s => s.label === status) || MSN_STATUSES[0]
  const isNudgeMessage = (msg: string) => msg === '🫨 ¡¡ZUMBIDO!! 🫨'
  const myAvatar = nickname.trim() ? MSN_AVATARS[nickname.trim().charCodeAt(0) % MSN_AVATARS.length] : '🧑'

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
          <span className="msn-toolbar-icon">👤</span>
          <span>Invite</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">📁</span>
          <span>Send Files</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🎥</span>
          <span>Video</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🔊</span>
          <span>Voice</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🎲</span>
          <span>Activities</span>
        </div>
        <div className="msn-toolbar-btn">
          <span className="msn-toolbar-icon">🃏</span>
          <span>Games</span>
        </div>
        <div className="msn-msn-logo">
          <span style={{ color: '#f77b00', fontWeight: 'bold', fontStyle: 'italic', fontSize: '15px', letterSpacing: '-0.5px' }}>msn</span>
          <span style={{ color: '#f77b00', fontSize: '8px', position: 'relative', top: '-4px' }}>🦋</span>
        </div>
      </div>

      {/* Main area */}
      <div className="msn-main">
        <div className="msn-main-left">
          {/* Header */}
          <div className="msn-header">
            <span className="msn-header-to">To: &lt; Guestbook &gt;</span>
          </div>

          {/* Chat */}
          <div className="msn-chat-area" ref={chatRef}>
            <div className="msn-system-msg">
              <span className="msn-system-text">💬 Welcome to the Guestbook! Leave a message for future visitors ✨</span>
            </div>

            {messages.map((msg) => {
              const avatar = MSN_AVATARS[msg.nickname.charCodeAt(0) % MSN_AVATARS.length]
              const msgStatus = MSN_STATUSES.find(s => s.label === msg.status)
              const nudge = isNudgeMessage(msg.message)

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

          {/* Typing indicator */}
          {isTyping && nickname.trim() && (
            <div className="msn-typing-indicator">
              ✏️ {nickname.trim()} está escribiendo...
            </div>
          )}
        </div>

        {/* Right sidebar with display pictures */}
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
        {/* Tool bar - matching exact MSN reference */}
        <div className="msn-input-toolbar">
          <button type="button" className="msn-tool-btn msn-font-btn" title="Font">A</button>
          <button
            type="button"
            className={`msn-tool-btn ${showEmoticons ? 'msn-tool-active' : ''}`}
            onClick={toggleEmoticons}
            title="Emoticons"
          >😊</button>
          <span className="msn-tool-dropdown">▾</span>
          <div className="msn-tool-separator" />
          <button type="button" className="msn-tool-btn msn-voice-clip-btn" title="Voice Clip">
            <span>🔊</span> <span>Voice Clip</span>
          </button>
          <div className="msn-tool-separator" />
          <button
            type="button"
            className={`msn-tool-btn ${showWinks ? 'msn-tool-active' : ''}`}
            onClick={toggleWinks}
            title="Winks"
          >😜</button>
          <button type="button" className="msn-tool-btn" title="Background">🖼️</button>
          <span className="msn-tool-dropdown">▾</span>
          <div className="msn-tool-separator" />
          <button type="button" className="msn-tool-btn" title="Gift">🎁</button>
          <button
            type="button"
            className="msn-tool-btn msn-nudge-tool"
            onClick={sendNudge}
            title="¡Enviar zumbido!"
          >🫨</button>
        </div>

        {/* Emoticon picker - positioned absolutely */}
        {showEmoticons && (
          <div className="msn-emoticon-picker">
            {Object.entries(MSN_EMOTICONS).map(([code, emoji]) => (
              <button
                type="button"
                key={code}
                className="msn-emo-btn"
                onClick={() => insertEmoticon(code)}
                title={code}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Winks picker */}
        {showWinks && (
          <div className="msn-winks-picker">
            {MSN_WINKS.map((w, i) => (
              <button type="button" key={i} className="msn-wink-btn" onClick={() => sendWink(w.text)}>{w.label}</button>
            ))}
          </div>
        )}

        {/* Compose */}
        <div className="msn-compose-area">
          <div className="msn-compose-left">
            <div className="msn-nick-row">
              <span className="msn-nick-label">Nick:</span>
              <input
                className="msn-nick-input"
                placeholder="Tu nickname..."
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={30}
              />
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
            <textarea
              ref={msgInputRef}
              className="msn-msg-input"
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              rows={2}
            />
          </div>
          <div className="msn-compose-right">
            <button type="button" className="msn-send-btn" onClick={handlePost} disabled={isPosting}>
              {isPosting ? '...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Bottom row */}
        <div className="msn-compose-bottom">
          {error && <span className="msn-error">{error}</span>}
          <span className="msn-char-count">{messageText.length}/500</span>
          <span className="msn-nudge-icon" onClick={sendNudge} title="Zumbido" role="button">🫨</span>
          <span className="msn-font-icon">A</span>
        </div>
      </div>

      {/* Status bar */}
      <div className="msn-statusbar">
        <span>{statusObj.icon} {status}</span>
        <span className="msn-statusbar-ad">Click for new Emoticons and Theme Packs</span>
        <span style={{ fontSize: '9px', opacity: 0.6 }}>
          {messages.length} msgs
        </span>
      </div>
    </div>
  )
}
