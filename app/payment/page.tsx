"use client"
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import StripePayment from '@/components/home-page/payments/StripePayment';
import AuthorizePayment from '@/components/home-page/payments/AuthorizePayment';

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [formData, setFormData] = useState<any>(null);
    const [processor, setProcessor] = useState<string>('');

    useEffect(() => {
        // Get processor from URL
        const processorParam = searchParams.get('processor');
        setProcessor(processorParam || '');

        // Get form data from sessionStorage
        const savedData = sessionStorage.getItem('annualReportFormData');
        if (savedData) {
            setFormData(JSON.parse(savedData));
        } else {
            // If no form data, redirect back to form
            router.push('/');
        }
    }, [searchParams, router]);

    const handleGoBack = () => {
        router.back();
    };

    if (!formData || !processor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Loading payment information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={handleGoBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Form
                </button>

                {/* Payment Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Secure Payment</h1>
                            <Shield className="w-8 h-8" />
                        </div>
                        <p className="text-blue-100">
                            You're purchasing the Annual Report for {formData.businessName}
                        </p>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Annual Report (2024)</span>
                                <span className="font-semibold text-gray-900">$210.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Processing Fee</span>
                                <span className="font-semibold text-gray-900">$0.00</span>
                            </div>
                            <div className="pt-2 border-t border-gray-300 flex justify-between">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-xl text-gray-900">$210.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Details</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {processor === 'stripe' ? 'Powered by Stripe' : 'Powered by Authorize.Net'}
                        </p>

                        {/* Render appropriate payment component */}
                        {processor === 'stripe' && <StripePayment formData={formData} />}
                        {processor === 'authorize' && <AuthorizePayment formData={formData} />}
                    </div>

                    {/* Customer Info Summary */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Billing Information</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Business:</span> {formData.businessName}</p>
                            <p><span className="font-medium">Email:</span> {formData.email}</p>
                            <p><span className="font-medium">Address:</span> {formData.address}</p>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-1" />
                        Your payment is secured with industry-standard encryption
                    </p>
                </div>
            </div>
        </div>
    );
}