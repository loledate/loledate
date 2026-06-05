import { useState, useRef, useEffect } from 'react'

import { useParams, Link } from 'react-router-dom'

import { useApp } from '../context/AppContext'

import type { ChatMessage } from '../types'

import Badge from '../components/Badge'

import Avatar from '../components/Avatar'

import ProfileSocials from '../components/ProfileSocials'



function formatMessageTime(iso: string) {

  return new Date(iso).toLocaleTimeString('es-ES', {

    hour: '2-digit',

    minute: '2-digit',

  })

}



export default function ChatPage() {

  const { matchId } = useParams<{ matchId: string }>()

  const { matches } = useApp()

  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [input, setInput] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)



  const match = matches.find((m) => m.id === matchId)



  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  }, [messages])



  const handleSend = () => {

    if (!input.trim() || !match) return



    const newMsg: ChatMessage = {

      id: `msg-${Date.now()}`,

      senderId: 'user-1',

      text: input.trim(),

      timestamp: new Date().toISOString(),

      isOwn: true,

    }



    setMessages((prev) => [...prev, newMsg])

    setInput('')

  }


  if (!match) {

    return (

      <div className="flex flex-col items-center justify-center px-4 py-20">

        <p className="text-sm text-muted">Match no encontrado</p>

        <Link to="/matches" className="btn-primary mt-4">

          Volver

        </Link>

      </div>

    )

  }



  return (

    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-2xl flex-col">

      <div className="flex items-center gap-3 border-b border-theme px-4 py-3">

        <Link to="/matches" className="text-sm text-muted hover:text-heading">

          Volver

        </Link>

        <Avatar

          url={match.profile.photoUrl}

          name={match.profile.name}

          className="h-8 w-8 rounded"

        />

        <div className="min-w-0 flex-1">

          <h2 className="truncate text-sm font-medium text-heading">

            {match.profile.name}

          </h2>

          <div className="flex items-center gap-2 text-xs text-muted">

            {match.profile.city}

            {match.profile.elo && (

              <Badge className="!px-1.5 !py-0 text-[10px]">

                {match.profile.elo}

              </Badge>

            )}

          </div>

          <ProfileSocials profile={match.profile} compact />

        </div>

      </div>



      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">

        {messages.length === 0 && (

          <p className="py-8 text-center text-sm text-heading/30">

            Sin mensajes. Escribe el primero.

          </p>

        )}

        {messages.map((msg) => (

          <div

            key={msg.id}

            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}

          >

            <div

              className={`max-w-[75%] px-4 py-2.5 ${

                msg.isOwn
                  ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-glow'
                  : 'rounded-2xl rounded-bl-md border border-theme bg-white text-heading'

              }`}

            >

              <p className="text-sm leading-relaxed">{msg.text}</p>

              <p

                className={`mt-1 text-[10px] ${

                  msg.isOwn ? 'text-white/70' : 'text-muted'

                }`}

              >

                {formatMessageTime(msg.timestamp)}

              </p>

            </div>

          </div>

        ))}

        <div ref={bottomRef} />

      </div>



      <div className="border-t border-theme p-4">

        <div className="flex items-center gap-3">

          <input

            type="text"

            value={input}

            onChange={(e) => setInput(e.target.value)}

            onKeyDown={(e) => e.key === 'Enter' && handleSend()}

            placeholder="Mensaje"

            className="input-field flex-1"

          />

          <button

            onClick={handleSend}

            disabled={!input.trim()}

            className="btn-primary px-4 py-3 disabled:opacity-30"

          >

            Enviar

          </button>

        </div>

      </div>

    </div>

  )

}

