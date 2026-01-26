"use client"

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Loader2, Shield } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
    clientSecret: string;
    formData: any;
}

function CheckoutForm({ clientSecret, formData }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/success?processor=stripe`,
                },
            });

            if (error) {
                setErrorMessage(error.message || 'Payment failed');
            }
        } catch (err) {
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Shield className="w-5 h-5 mr-2" />
                        Pay $210.00 Securely
                    </>
                )}
            </button>

            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
            )}
        </form>
    );
}

export default function StripePayment({ formData }: { formData: any }) {
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        createPaymentIntent();
    }, []);

    const createPaymentIntent = async () => {
        try {
            const response = await fetch('/api/create-stripe-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 21000, // $210.00 in cents
                    formData: formData,
                }),
            });

            const data = await response.json();

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                setError('Failed to initialize payment');
            }
        } catch (err) {
            setError('Failed to connect to payment server');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (!clientSecret) {
        return null;
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} formData={formData} />
        </Elements>
    );
}