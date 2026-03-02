'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function SellPage() {
  const router = useRouter()
  const params = useParams()
  const occurrenceId = params.occurrenceId as string

  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingListing, setExistingListing] = useState<any>(null)
  const [occurrence, setOccurrence] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load occurrence info
      const { data: occ } = await supabase
        .from('event_occurrences')
        .select('*, event:events(*)')
        .eq('id', occurrenceId)
        .single()
      setOccurrence(occ)

      // Check for existing listing
      const { data: existing } = await supabase
        .from('ticket_listings')
        .select('*')
        .eq('occurrence_id', occurrenceId)
        .eq('seller_id', user.id)
        .eq('status', 'available')
        .single()

      if (existing) {
        setExistingListing(existing)
        setPrice(existing.price.toString())
        setQuantity(existing.quantity.toString())
        setNotes(existing.notes ?? '')
      }
    }
    load()
  }, [occurrenceId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const listingData = {
      occurrence_id: occurrenceId,
      seller_id: user.id,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      notes: notes || null,
    }

    if (existingListing) {
      const { error: updateError } = await supabase
        .from('ticket_listings')
        .update(listingData)
        .eq('id', existingListing.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('ticket_listings')
        .insert(listingData)

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push(`/events/${occurrenceId}`)
  }

  async function handleDelete() {
    if (!existingListing) return
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('ticket_listings')
      .update({ status: 'expired' })
      .eq('id', existingListing.id)
    router.push(`/events/${occurrenceId}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/events/${occurrenceId}`} className="text-purple-600 hover:underline text-sm">
          ← Back to marketplace
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {existingListing ? 'Edit Your Listing' : 'Sell Tickets'}
        </h1>
        {occurrence?.event && (
          <p className="text-gray-500 text-sm mb-6">
            {occurrence.event.title} · {new Date(occurrence.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per ticket (£)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 12.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. VIP entry, standing tickets..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : existingListing ? 'Update Listing' : 'List Tickets'}
          </button>

          {existingListing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 font-semibold py-2 rounded-lg transition-colors border border-red-200"
            >
              Remove Listing
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
