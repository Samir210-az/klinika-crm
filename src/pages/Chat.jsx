import { useEffect, useState, useCallback, useRef } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Avatar, EmptyState } from '../components/ui'
import { Send, Megaphone } from 'lucide-react'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
  laborant: 'Laborant',
}

const POLL_INTERVAL = 6000

export default function Chat() {
  const { employee } = useAuth()
  const [colleagues, setColleagues] = useState([])
  const [activeConversation, setActiveConversation] = useState('general')
  const [unreadCounts, setUnreadCounts] = useState({})

  useEffect(() => {
    apiRequest('/employees/public').then((d) => setColleagues(d.employees.filter((e) => e.id !== employee.id)))
  }, [employee.id])

  const loadUnread = useCallback(async () => {
    const data = await apiRequest('/messages/unread')
    setUnreadCounts(data.counts)
  }, [])

  useEffect(() => {
    loadUnread()
    const t = setInterval(loadUnread, POLL_INTERVAL)
    return () => clearInterval(t)
  }, [loadUnread])

  return (
    <div className="flex h-[calc(100vh-64px-73px)] md:rounded-2xl md:border md:border-black/[0.06] overflow-hidden">
      <aside className="w-28 md:w-56 shrink-0 border-r border-black/[0.06] bg-surface overflow-y-auto">
        <button
          onClick={() => setActiveConversation('general')}
          className={`w-full flex items-center gap-2 px-3 py-3 text-left border-b border-black/5 ${
            activeConversation === 'general' ? 'bg-primary-light' : 'hover:bg-black/[0.02]'
          }`}
        >
          <div className="w-8 h-8 shrink-0 rounded-full bg-primary text-white flex items-center justify-center">
            <Megaphone size={15} />
          </div>
          <div className="min-w-0 flex-1 hidden md:block">
            <div className="text-sm font-medium text-ink truncate">Ümumi</div>
          </div>
          {unreadCounts.general > 0 && <UnreadDot count={unreadCounts.general} />}
        </button>

        {colleagues.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveConversation(c.id)}
            className={`w-full flex items-center gap-2 px-3 py-3 text-left border-b border-black/5 ${
              activeConversation === c.id ? 'bg-primary-light' : 'hover:bg-black/[0.02]'
            }`}
          >
            <Avatar name={c.full_name} />
            <div className="min-w-0 flex-1 hidden md:block">
              <div className="text-sm font-medium text-ink truncate">{c.full_name}</div>
              <div className="text-xs text-ink/60 truncate">{ROLE_LABELS[c.role]}</div>
            </div>
            {unreadCounts[c.id] > 0 && <UnreadDot count={unreadCounts[c.id]} />}
          </button>
        ))}
      </aside>

      <ConversationView
        key={activeConversation}
        conversation={activeConversation}
        title={activeConversation === 'general' ? 'Ümumi' : colleagues.find((c) => c.id === activeConversation)?.full_name}
        onRead={loadUnread}
      />
    </div>
  )
}

function UnreadDot({ count }) {
  return (
    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-medium flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  )
}

function ConversationView({ conversation, title, onRead }) {
  const { employee } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const load = useCallback(async () => {
    const data = await apiRequest(`/messages?conversation=${conversation}`)
    setMessages(data.messages)
  }, [conversation])

  useEffect(() => {
    load()
    apiRequest('/messages/read', { method: 'POST', body: { conversation } }).then(onRead)
    const t = setInterval(load, POLL_INTERVAL)
    return () => clearInterval(t)
  }, [conversation, load, onRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    const content = text
    setText('')
    try {
      await apiRequest('/messages', { method: 'POST', body: { conversation, content } })
      load()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-bg min-w-0 min-h-0">
      <div className="px-4 py-3 border-b border-black/[0.06] bg-surface">
        <div className="font-medium text-ink">{title}</div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <EmptyState title="Hələ mesaj yoxdur" hint="İlk mesajı sən göndər." />
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === employee.id
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isMine ? 'bg-primary text-white' : 'bg-surface border border-black/[0.06] text-ink'}`}>
                  {!isMine && conversation === 'general' && (
                    <div className="text-xs font-medium text-primary mb-0.5">{m.sender?.full_name}</div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  <div className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-ink/50'}`}>
                    {new Date(m.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-black/[0.06] bg-surface flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesaj yaz…"
          className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-xl bg-primary text-white px-4 flex items-center justify-center disabled:opacity-50"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
