import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

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

function replaceEmoticons(text: string): string {
  let result = text
  // Sort by length desc to replace longer patterns first
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

// Simple rate limiter
let lastPostTime = 0

export default function MSNMessenger() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [nickname, setNickname] = useState('')
  const [status, setStatus] = useState('Online')
  const [messageText, setMessageText] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState('')
  const [showEmoticons, setShowEmoticons] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

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

    // Realtime subscription
    const channel = supabase
      .channel('guestbook')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guestbook_messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new as GuestbookMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const handlePost = useCallback(async () => {
    const trimNick = nickname.trim()
    const trimMsg = messageText.trim()

    if (!trimNick) { setError('Enter a nickname!'); return }
    if (!trimMsg) { setError('Type a message!'); return }
    if (trimNick.length > 30) { setError('Nickname too long (max 30)'); return }
    if (trimMsg.length > 500) { setError('Message too long (max 500)'); return }

    // Rate limit: 5 seconds between posts
    if (Date.now() - lastPostTime < 5000) {
      setError('Slow down! Wait a few seconds.')
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
      setError('Failed to send. Try again!')
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

  const statusObj = MSN_STATUSES.find(s => s.label === status) || MSN_STATUSES[0]

  return (
    <div className="msn-messenger">
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
        <div className="msn-toolbar-btn">📨 Invitar</div>
        <div className="msn-toolbar-btn">📁 Archivos</div>
        <div className="msn-toolbar-btn">📷 Cámara</div>
        <div className="msn-toolbar-btn">🔊 Audio</div>
        <div className="msn-toolbar-btn">🎮 Juegos</div>
        <div className="msn-msn-logo">
          <span style={{ color: '#f77b00', fontWeight: 'bold', fontStyle: 'italic', fontSize: '13px' }}>msn</span>
        </div>
      </div>

      {/* Header */}
      <div className="msn-header">
        <span className="msn-header-to">Para: &lt; Guestbook &gt;</span>
      </div>

      {/* Chat Area */}
      <div className="msn-chat-area" ref={chatRef}>
        {/* Welcome message */}
        <div className="msn-system-msg">
          <span className="msn-system-text">💬 Welcome to the Guestbook! Leave a message for future visitors ✨</span>
        </div>

        {messages.map((msg) => {
          const avatar = MSN_AVATARS[msg.nickname.charCodeAt(0) % MSN_AVATARS.length]
          const msgStatus = MSN_STATUSES.find(s => s.label === msg.status)
          return (
            <div key={msg.id} className="msn-message">
              <div className="msn-msg-header">
                <span className="msn-msg-avatar">{avatar}</span>
                <span className="msn-msg-nick" style={{ fontWeight: 'bold' }}>
                  {msg.nickname}
                </span>
                {msg.status && (
                  <span className="msn-msg-status" style={{ color: msgStatus?.color || '#666' }}>
                    {msgStatus?.icon || '🟢'} {msg.status}
                  </span>
                )}
                <span className="msn-msg-time">{timeAgo(msg.created_at)}</span>
              </div>
              <div className="msn-msg-body">
                {replaceEmoticons(msg.message)}
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

      {/* Input Area */}
      <div className="msn-input-area">
        {/* Emoticon bar */}
        <div className="msn-emoticon-bar">
          <button className="msn-emo-toggle" onClick={() => setShowEmoticons(!showEmoticons)}>
            😊 Emoticons
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
            placeholder="Your nickname..."
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={30}
          />
          <div className="msn-msg-compose">
            <textarea
              className="msn-msg-input"
              placeholder="Type a message... (max 500 chars)"
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
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
