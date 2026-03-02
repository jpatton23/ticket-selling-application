'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ChatClientProps {
  conversation: any
  initialMessages: any[]
  currentUser: any
  isSeller: boolean
}

export default function ChatClient({ conversation, initialMessages, currentUser, isSeller }: ChatClientProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [requestingPayment, setRequestingPayment] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const otherUser = isSeller ? conversation.buyer : conversation.seller
  const event = conversation.occurrence?.event
  const listing = conversation.listing

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          // Fetch the full message with sender profile
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setMessages(prev => [...prev, data])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const supabase = createClient()
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: currentUser.id,
      content: newMessage.trim(),
      message_type: 'text',
    })
    setNewMessage('')
    setSending(false)
  }

  async function sendPaymentRequest() {
    setRequestingPayment(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          listingId: listing.id,
          amount: listing.price,
          quantity: 1,
        }),
      })
      const data = await res.json()
      if (data.url) {
        const supabase = createClient()
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content: `Payment request for £${Number(listing.price).toFixed(2)}`,
          message_type: 'payment_request',
          stripe_checkout_url: data.url,
        })
      }
    } catch (err) {
      console.error(err)
    }
    setRequestingPayment(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-[#111111] rounded-xl border border-white/10 p-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-gray-500 hover:text-white">←</Link>
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
            {otherUser?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-white">{otherUser?.name}</p>
            <p className="text-xs text-gray-500">{event?.title} · £{Number(listing?.price).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.sender_id === currentUser.id
          if (msg.message_type === 'payment_request') {
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 max-w-xs">
                  <p className="text-sm font-medium text-yellow-300 mb-2">💳 {msg.content}</p>
                  {!isMe && msg.stripe_checkout_url && (
                    <a
                      href={msg.stripe_checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors"
                    >
                      Pay Now
                    </a>
                  )}
                </div>
              </div>
            )
          }
          if (msg.message_type === 'payment_confirmed') {
            return (
              <div key={msg.id} className="text-center text-green-400 text-sm py-2">
                ✓ Payment confirmed
              </div>
            )
          }
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 ${isMe ? 'bg-purple-600 text-white' : 'bg-[#1a1a1a] border border-white/10 text-gray-200'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-[#111111] rounded-xl border border-white/10 p-3 shrink-0">
        {isSeller && (
          <div className="mb-2">
            <button
              onClick={sendPaymentRequest}
              disabled={requestingPayment}
              className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {requestingPayment ? 'Creating...' : '💳 Request Payment'}
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 text-white placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
