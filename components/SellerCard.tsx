'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TicketListing } from '@/types/database'

interface SellerCardProps {
  listing: TicketListing & { seller?: any }
  occurrenceId: string
  currentUserId: string
}

export default function SellerCard({ listing, occurrenceId, currentUserId }: SellerCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const seller = listing.seller
  const isOwnListing = listing.seller_id === currentUserId

  async function handleMessage() {
    setLoading(true)
    const supabase = createClient()

    // Find or create conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('occurrence_id', occurrenceId)
      .eq('buyer_id', currentUserId)
      .eq('seller_id', listing.seller_id)
      .eq('listing_id', listing.id)
      .single()

    if (existing) {
      router.push(`/messages/${existing.id}`)
      return
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({
        occurrence_id: occurrenceId,
        buyer_id: currentUserId,
        seller_id: listing.seller_id,
        listing_id: listing.id,
      })
      .select('id')
      .single()

    if (conv) {
      router.push(`/messages/${conv.id}`)
    } else {
      console.error(error)
      setLoading(false)
    }
  }

  const universityLabel = seller?.university === 'UoS' ? 'UoS' : 'SHU'
  const universityColor = seller?.university === 'UoS' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">
        {seller?.name?.[0]?.toUpperCase() ?? '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{seller?.name ?? 'Unknown'}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${universityColor}`}>
            {universityLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>⭐ {seller?.rating ? Number(seller.rating).toFixed(1) : 'New'}</span>
          <span>·</span>
          <span>{listing.quantity} ticket{listing.quantity !== 1 ? 's' : ''}</span>
          {listing.notes && (
            <>
              <span>·</span>
              <span className="truncate">{listing.notes}</span>
            </>
          )}
        </div>
      </div>

      {/* Price & Action */}
      <div className="text-right shrink-0">
        <p className="text-xl font-bold text-gray-900">£{Number(listing.price).toFixed(2)}</p>
        {!isOwnListing ? (
          <button
            onClick={handleMessage}
            disabled={loading}
            className="mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {loading ? '...' : 'Message'}
          </button>
        ) : (
          <span className="mt-2 block text-xs text-gray-400">Your listing</span>
        )}
      </div>
    </div>
  )
}
