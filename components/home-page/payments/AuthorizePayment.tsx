"use client"

import React, { useState } from 'react';
import { CreditCard, Loader2, Shield, Lock } from 'lucide-react';

interface AuthorizePaymentProps {
    formData: any;
}

export default function AuthorizePayment({ formData }: AuthorizePaymentProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setCardData(prev => ({ ...prev, [name]: formatted }));
        } else {
            setCardData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/process-authorize-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 210.00,
                    cardData: {
                        ...cardData,
                        cardNumber: cardData.cardNumber.replace(/\s/g, '')
                    },
                    formData: formData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to success page
                window.location.href = `/success?processor=authorize&transaction=${data.transactionId}`;
            } else {
                setError(data.message || 'Payment failed. Please check your card details.');
            }
        } catch (err) {
            setError('An error occurred while processing your payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cardholder Name */}
            <div>
                <label htmlFor="cardholderName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Cardholder Name *
                </label>
                <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={cardData.cardholderName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                />
            </div>

            {/* Card Number */}
            <div>
                <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Card Number *
                </label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleInputChange}
                        required
                        maxLength={19}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="1234 5678 9012 3456"
                    />
                </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="expiryMonth" className="block text-sm font-semibold text-gray-700 mb-2">
                        Month *
                    </label>
                    <select
                        id="expiryMonth"
                        name="expiryMonth"
                        value={cardData.expiryMonth}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="expiryYear" className="block text-sm font-semibold text-gray-700 mb-2">
                        Year *
                    </label>
                    <select
                        id="expiryYear"
                        name="expiryYear"
                        value={cardData.expiryYear}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="">YY</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year.toString().slice(-2)}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="cvv" className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleInputChange}
                            required
                            maxLength={4}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                            placeholder="123"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Shield className="w-5 h-5 mr-2" />
                        Pay $210.00 Securely
                    </>
                )}
            </button>

            {/* Security Badge */}
            <div className="text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center">
                    <Lock className="w-3 h-3 mr-1" />
                    Secured by Authorize.Net - PCI DSS Compliant
                </p>
            </div>
        </form>
    );
}