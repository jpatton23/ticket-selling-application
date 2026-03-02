export type University = 'UoS' | 'SHU'
export type Category = 'club' | 'sports' | 'racing' | 'other'
export type RecurrenceType = 'weekly' | 'one_off'
export type OccurrenceStatus = 'upcoming' | 'active' | 'ended'
export type ListingStatus = 'available' | 'sold' | 'expired'
export type MessageType = 'text' | 'payment_request' | 'payment_confirmed'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Profile {
  id: string
  name: string
  email: string
  university: University
  avatar_url: string | null
  rating: number
  rating_count: number
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  category: Category
  venue: string
  image_url: string | null
  recurrence_type: RecurrenceType
  day_of_week: number | null
  event_time: string | null
  event_date: string | null
  reset_after_hours: number
  is_active: boolean
  created_at: string
}

export interface EventOccurrence {
  id: string
  event_id: string
  date: string
  status: OccurrenceStatus
  created_at: string
  event?: Event
}

export interface TicketListing {
  id: string
  occurrence_id: string
  seller_id: string
  price: number
  quantity: number
  notes: string | null
  status: ListingStatus
  created_at: string
  seller?: Profile
  occurrence?: EventOccurrence
}

export interface Conversation {
  id: string
  occurrence_id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  created_at: string
  buyer?: Profile
  seller?: Profile
  listing?: TicketListing
  occurrence?: EventOccurrence
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  stripe_checkout_url: string | null
  created_at: string
  sender?: Profile
}

export interface Transaction {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  amount: number
  quantity: number
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  status: TransactionStatus
  created_at: string
}

export interface Rating {
  id: string
  transaction_id: string
  rater_id: string
  rated_id: string
  score: number
  comment: string | null
  created_at: string
}
