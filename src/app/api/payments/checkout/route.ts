import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_SECRET_KEY!,
  environment: 'test_mode',
})

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a Dodo Payments checkout session
    const session = await dodo.payments.create({
      billing: {
        city: '',
        country: 'US',
        state: '',
        street: '',
        zipcode: '',
      },
      customer: {
        email: user.email!,
        name: user.email!,
      },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID!,
          quantity: 1,
        },
      ],
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/check?upgraded=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.payment_link })
  } catch (error) {
    console.error('Dodo checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
