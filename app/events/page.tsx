import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventsClient from '@/components/EventsClient'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch upcoming occurrences with event data and listing counts
  const { data: occurrences } = await supabase
    .from('event_occurrences')
    .select(`
      *,
      event:events(*),
      ticket_listings(count)
    `)
    .neq('status', 'ended')
    .order('date', { ascending: true })

  return <EventsClient occurrences={occurrences || []} />
}
