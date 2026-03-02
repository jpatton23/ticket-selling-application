import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatClient from '@/components/ChatClient'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      *,
      buyer:profiles!conversations_buyer_id_fkey(*),
      seller:profiles!conversations_seller_id_fkey(*),
      listing:ticket_listings(*),
      occurrence:event_occurrences(*, event:events(*))
    `)
    .eq('id', conversationId)
    .single()

  if (!conversation) notFound()

  // Verify user is a participant
  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
    redirect('/messages')
  }

  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*, sender:profiles(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <ChatClient
      conversation={conversation}
      initialMessages={initialMessages ?? []}
      currentUser={profile}
      isSeller={conversation.seller_id === user.id}
    />
  )
}
