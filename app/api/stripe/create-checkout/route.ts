import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, listingId, amount, quantity } = await request.json()

    // Fetch listing details
    const { data: listing } = await supabase
      .from('ticket_listings')
      .select('*, occurrence:event_occurrences(*, event:events(*))')
      .eq('id', listingId)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const eventTitle = listing.occurrence?.event?.title ?? 'Event Ticket'
    const unitAmount = Math.round(parseFloat(amount) * 100)

    // Create transaction record
    const { data: transaction } = await supabase
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount: parseFloat(amount) * quantity,
        quantity,
        status: 'pending',
      })
      .select('id')
      .single()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: eventTitle,
              description: listing.notes ?? undefined,
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/messages/${conversationId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/messages/${conversationId}?payment=cancelled`,
      metadata: {
        transactionId: transaction?.id ?? '',
        listingId,
        conversationId,
        buyerId: user.id,
        quantity: quantity.toString(),
      },
    })

    // Update transaction with checkout session id
    if (transaction) {
      await supabase
        .from('transactions')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', transaction.id)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
