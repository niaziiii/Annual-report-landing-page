"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({ amount }: { amount: any }) {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError("");

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success?processor=stripe`,
            },
        });

        if (error) setError(error.message || "Payment failed");
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-md transition flex items-center justify-center disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing…
                    </>
                ) : (
                    <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Pay ${amount}
                    </>
                )}
            </button>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {error}
                </div>
            )}
        </form>
    );
}

export default function StripePayment({ formData, amount }: { formData: any, amount: any }) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/create-stripe-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount * 100, formData }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.clientSecret) setClientSecret(data.clientSecret);
                else setError("Unable to initialize payment");
            })
            .catch(() => setError("Payment server unavailable"))
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
        );

    if (error)
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
            </div>
        );

    if (!clientSecret) return null;

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm amount={amount} />
        </Elements>
    );
}
