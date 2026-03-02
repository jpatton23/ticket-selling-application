import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import RatingStars from '@/components/RatingStars'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      listing:ticket_listings(*, occurrence:event_occurrences(*, event:events(*)))
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl">
            {profile?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
              profile?.university === 'UoS' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {profile?.university === 'UoS' ? 'University of Sheffield' : 'Sheffield Hallam University'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RatingStars rating={profile?.rating ?? 0} />
          <span className="text-gray-500 text-sm">
            {profile?.rating ? `${Number(profile.rating).toFixed(1)} (${profile.rating_count} reviews)` : 'No ratings yet'}
          </span>
        </div>
      </div>

      {/* Transaction History */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No completed transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {transactions.map((tx: any) => {
            const isBuyer = tx.buyer_id === user.id
            const event = tx.listing?.occurrence?.event
            return (
              <div key={tx.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{event?.title ?? 'Unknown event'}</p>
                    <p className="text-sm text-gray-500">
                      {isBuyer ? '🛍 Bought' : '🏷 Sold'} · {tx.quantity} ticket{tx.quantity !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">£{Number(tx.amount).toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <LogoutButton />
    </div>
  )
}
