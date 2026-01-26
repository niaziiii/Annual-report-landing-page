// app/api/create-stripe-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const { amount, formData } = await request.json();

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                businessName: formData.businessName,
                email: formData.email,
                address: formData.address,
                signature: formData.signature,
            },
            description: 'Annual Report Purchase',
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Stripe payment error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}