import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import SellerCard from '@/components/SellerCard'

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ occurrenceId: string }>
}) {
  const { occurrenceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: occurrence } = await supabase
    .from('event_occurrences')
    .select('*, event:events(*)')
    .eq('id', occurrenceId)
    .single()

  if (!occurrence) notFound()

  const { data: listings } = await supabase
    .from('ticket_listings')
    .select('*, seller:profiles(*)')
    .eq('occurrence_id', occurrenceId)
    .eq('status', 'available')
    .order('price', { ascending: true })

  const event = occurrence.event
  const dateFormatted = new Date(occurrence.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        {event?.image_url && (
          <div className="h-64 overflow-hidden">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">{event?.title}</h1>
            {event?.category && <CategoryBadge category={event.category} />}
          </div>
          <p className="text-gray-500 mb-1">📍 {event?.venue}</p>
          <p className="text-gray-500 mb-4">📅 {dateFormatted}</p>
          {event?.description && (
            <p className="text-gray-600">{event.description}</p>
          )}
        </div>
      </div>

      {/* Sell CTA */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Available Tickets ({listings?.length ?? 0})
        </h2>
        <Link
          href={`/events/${occurrenceId}/sell`}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          + Sell Tickets
        </Link>
      </div>

      {/* Listings */}
      {!listings || listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No tickets available yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to sell!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <SellerCard
              key={listing.id}
              listing={listing}
              occurrenceId={occurrenceId}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
