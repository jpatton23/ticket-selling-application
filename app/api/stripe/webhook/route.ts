import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { transactionId, listingId, conversationId, buyerId, quantity } = session.metadata ?? {}

    // Use service role key for webhook operations
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

    // Update transaction status
    await supabase
      .from('transactions')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', transactionId)

    // Decrement listing quantity
    const { data: listing } = await supabase
      .from('ticket_listings')
      .select('quantity')
      .eq('id', listingId)
      .single()

    if (listing) {
      const newQuantity = listing.quantity - parseInt(quantity ?? '1')
      await supabase
        .from('ticket_listings')
        .update({
          quantity: newQuantity,
          status: newQuantity <= 0 ? 'sold' : 'available',
        })
        .eq('id', listingId)
    }

    // Add payment confirmed message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: buyerId,
      content: 'Payment completed successfully! 🎉',
      message_type: 'payment_confirmed',
    })
  }

  return NextResponse.json({ received: true })
}
