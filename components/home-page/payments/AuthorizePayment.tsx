"use client";

import React, { useState } from "react";
import { CreditCard, Loader2, ShieldCheck, Lock } from "lucide-react";

interface AuthorizePaymentProps {
    formData: any;
}

export default function AuthorizePayment({ formData }: AuthorizePaymentProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [cardData, setCardData] = useState({
        cardholderName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
    });

    // =========================
    // INPUT HANDLING
    // =========================
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "cardNumber") {
            const formatted = value
                .replace(/\D/g, "")
                .replace(/(.{4})/g, "$1 ")
                .trim();
            setCardData((prev) => ({ ...prev, cardNumber: formatted }));
            return;
        }

        setCardData((prev) => ({ ...prev, [name]: value }));
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/process-authorize-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 210.0,
                    cardData: {
                        ...cardData,
                        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
                    },
                    formData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = `/success?processor=authorize&transaction=${data.transactionId}`;
            } else {
                setError(data.message || "Payment was declined. Please review your details.");
            }
        } catch {
            setError("Unable to process payment at this time. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UI
    // =========================
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cardholder */}
            <Field label="Cardholder Name">
                <input
                    name="cardholderName"
                    value={cardData.cardholderName}
                    onChange={handleChange}
                    required
                    placeholder="Name as shown on card"
                    className="input"
                />
            </Field>

            {/* Card Number */}
            <Field label="Card Number" icon={<CreditCard className="w-5 h-5" />}>
                <input
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleChange}
                    required
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    className="input"
                />
            </Field>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-3 gap-4">
                <Field label="Expiry Month">
                    <select
                        name="expiryMonth"
                        value={cardData.expiryMonth}
                        onChange={handleChange}
                        required
                        className="input pl-3"
                    >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const m = String(i + 1).padStart(2, "0");
                            return (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            );
                        })}
                    </select>
                </Field>

                <Field label="Expiry Year">
                    <select
                        name="expiryYear"
                        value={cardData.expiryYear}
                        onChange={handleChange}
                        required
                        className="input pl-3"
                    >
                        <option value="">YY</option>
                        {Array.from({ length: 10 }).map((_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                                <option key={year} value={String(year).slice(-2)}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                </Field>

                <Field label="CVV" icon={<Lock className="w-4 h-4" />}>
                    <input
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleChange}
                        required
                        maxLength={4}
                        placeholder="123"
                        className="input pl-10"
                    />
                </Field>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
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
                        Pay $210.00
                    </>
                )}
            </button>

            {/* Security */}
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Authorize.Net · PCI-DSS Compliant · Encrypted
            </p>

            {/* Shared input styles */}
            <style jsx>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          outline: none;
        }
        .input:focus {
          border-color: #111827;
          box-shadow: 0 0 0 1px #111827;
        }
      `}</style>
        </form>
    );
}

// =========================
// FIELD
// =========================
function Field({
    label,
    icon,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
