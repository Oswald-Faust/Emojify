import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, paymentMethodId, email } = await req.json()

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'xof',
      payment_method: paymentMethodId,
      confirm: true,
      receipt_email: email,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // For simplicity in this demo, we avoid redirects
      },
    })

    return new Response(
      JSON.stringify({ paymentIntent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
