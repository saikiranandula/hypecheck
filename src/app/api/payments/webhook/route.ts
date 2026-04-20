import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WebhookPayload {
  type: string
  data: {
    metadata?: {
      supabase_user_id?: string
    }
    customer?: {
      customer_id?: string
    }
    [key: string]: unknown
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET!

    const webhook = new Webhook(webhookSecret)
    let payload: WebhookPayload

    try {
      payload = webhook.verify(rawBody, {
        'webhook-id': req.headers.get('webhook-id') ?? '',
        'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
        'webhook-signature': req.headers.get('webhook-signature') ?? '',
      }) as WebhookPayload
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (payload.type === 'payment.succeeded') {
      const userId = payload.data.metadata?.supabase_user_id

      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({
            plan: 'pro',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (error) {
          console.error('Error updating profile to pro:', error)
          return NextResponse.json(
            { error: 'Database update failed' },
            { status: 500 }
          )
        }

        console.log('User upgraded to pro:', userId)
      }
    }

    if (payload.type === 'subscription.cancelled') {
      const userId = payload.data.metadata?.supabase_user_id

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        console.log('User downgraded to free:', userId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
