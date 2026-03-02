import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      buyer:profiles!conversations_buyer_id_fkey(*),
      seller:profiles!conversations_seller_id_fkey(*),
      listing:ticket_listings(*),
      occurrence:event_occurrences(*, event:events(*))
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Start by messaging a seller on an event page</p>
          <Link href="/events" className="mt-4 inline-block text-purple-600 hover:underline text-sm">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv: any) => {
            const otherUser = conv.buyer_id === user.id ? conv.seller : conv.buyer
            const role = conv.buyer_id === user.id ? 'Buyer' : 'Seller'
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    {otherUser?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{otherUser?.name ?? 'Unknown'}</span>
                      <span className="text-xs text-gray-400">({role})</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.occurrence?.event?.title} · £{Number(conv.listing?.price).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(conv.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
