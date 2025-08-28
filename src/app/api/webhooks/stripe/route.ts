import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session

                if (session.payment_status === 'paid') {
                    // Get the generation record
                    const { data: generation, error: fetchError } = await supabaseAdmin
                        .from('generations')
                        .select('*')
                        .eq('stripe_payment_intent_id', session.payment_intent)
                        .single()

                    if (fetchError || !generation) {
                        console.error('Generation not found:', fetchError)
                        return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
                    }

                    // Update status to processing
                    await supabaseAdmin
                        .from('generations')
                        .update({
                            status: 'processing',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', generation.id)

                    // Trigger N8N workflow
                    const n8nPayload = {
                        generationId: generation.id,
                        userId: generation.user_id,
                        imageUrl: generation.original_image_url,
                        promptText: generation.prompt_text,
                        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`
                    }

                    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(n8nPayload),
                    })

                    if (!n8nResponse.ok) {
                        console.error('N8N webhook failed:', await n8nResponse.text())
                        // Update status to failed
                        await supabaseAdmin
                            .from('generations')
                            .update({
                                status: 'failed',
                                error_message: 'Failed to trigger N8N workflow',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', generation.id)
                    }
                }
                break

            case 'payment_intent.payment_failed':
                const paymentIntent = event.data.object as Stripe.PaymentIntent

                // Update generation status to failed
                await supabaseAdmin
                    .from('generations')
                    .update({
                        status: 'failed',
                        error_message: 'Payment failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_payment_intent_id', paymentIntent.id)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
