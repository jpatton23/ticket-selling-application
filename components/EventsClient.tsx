'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EventOccurrence, Category } from '@/types/database'
import CategoryBadge from './CategoryBadge'

interface OccurrenceWithCount extends EventOccurrence {
  ticket_listings: { count: number }[]
}

const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'club', label: '🎵 Clubs' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'racing', label: '🐎 Racing' },
  { value: 'other', label: '✨ Other' },
]

export default function EventsClient({ occurrences }: { occurrences: OccurrenceWithCount[] }) {
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = occurrences.filter(o => {
    const matchCat = category === 'all' || o.event?.category === category
    const matchSearch = !search || o.event?.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Upcoming Events</h1>
      <p className="text-gray-400 mb-6">Find tickets for Sheffield&apos;s best nights out</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#1a1a1a] border border-white/10 text-white placeholder:text-gray-500 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No events found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(occurrence => (
            <EventCard key={occurrence.id} occurrence={occurrence} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ occurrence }: { occurrence: OccurrenceWithCount }) {
  const event = occurrence.event
  if (!event) return null

  const ticketCount = occurrence.ticket_listings?.[0]?.count ?? 0
  const dateFormatted = new Date(occurrence.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden hover:border-white/20 transition-all">
      {event.image_url && (
        <div className="h-56 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-lg leading-tight">{event.title}</h3>
          <CategoryBadge category={event.category} />
        </div>
        <p className="text-gray-400 text-sm mb-1">📍 {event.venue}</p>
        <p className="text-gray-400 text-sm mb-1">📅 {dateFormatted}</p>
        {event.event_time && (
          <p className="text-gray-400 text-sm mb-3">🕙 {event.event_time.slice(0, 5)}</p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">
            {ticketCount > 0 ? `${ticketCount} ticket${ticketCount !== 1 ? 's' : ''} available` : 'No tickets yet'}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/events/${occurrence.id}`}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-center text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Buy
          </Link>
          <Link
            href={`/events/${occurrence.id}/sell`}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-center text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Sell
          </Link>
        </div>
      </div>
    </div>
  )
}
