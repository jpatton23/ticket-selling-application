import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )

  const today = new Date().toISOString().split('T')[0]

  // Find occurrences that have passed and are not yet ended
  const { data: passedOccurrences } = await supabase
    .from('event_occurrences')
    .select('*, event:events(*)')
    .lt('date', today)
    .neq('status', 'ended')

  if (!passedOccurrences || passedOccurrences.length === 0) {
    return NextResponse.json({ message: 'No occurrences to reset', processed: 0 })
  }

  let processed = 0

  for (const occurrence of passedOccurrences) {
    // Mark occurrence as ended
    await supabase
      .from('event_occurrences')
      .update({ status: 'ended' })
      .eq('id', occurrence.id)

    // Expire all listings for this occurrence
    await supabase
      .from('ticket_listings')
      .update({ status: 'expired' })
      .eq('occurrence_id', occurrence.id)
      .eq('status', 'available')

    // If this is a weekly recurring event, create next occurrence
    if (occurrence.event?.recurrence_type === 'weekly' && occurrence.event?.day_of_week !== null) {
      const nextDate = getNextWeekday(occurrence.event.day_of_week)
      await supabase
        .from('event_occurrences')
        .insert({
          event_id: occurrence.event_id,
          date: nextDate,
          status: 'upcoming',
        })
    }

    processed++
  }

  return NextResponse.json({ message: 'Reset complete', processed })
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request)
}

function getNextWeekday(dayOfWeek: number): string {
  const today = new Date()
  const todayDow = today.getDay()
  let daysUntil = (dayOfWeek - todayDow + 7) % 7
  if (daysUntil === 0) daysUntil = 7
  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + daysUntil)
  return nextDate.toISOString().split('T')[0]
}
