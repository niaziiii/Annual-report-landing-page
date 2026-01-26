"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, FileText, Mail, Clock, Home } from 'lucide-react';

export default function SuccessClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [processor, setProcessor] = useState<string>('');
    const [transactionId, setTransactionId] = useState<string>('');
    const [formData, setFormData] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const processorParam = searchParams.get('processor');
        const transactionParam = searchParams.get('transaction');

        setProcessor(processorParam || '');
        setTransactionId(transactionParam || '');

        // Get form data from sessionStorage
        const savedData = sessionStorage.getItem('annualReportFormData');
        if (savedData) {
            setFormData(JSON.parse(savedData));

            // Save to database
            saveToDatabase(JSON.parse(savedData), processorParam || '', transactionParam || '');
        }
    }, [searchParams]);

    const saveToDatabase = async (data: any, proc: string, txnId: string) => {
        try {
            const response = await fetch('/api/save-annual-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    paymentProcessor: proc,
                    transactionId: txnId,
                    paymentStatus: 'completed',
                    amount: 210.00
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSaved(true);
                // Clear sessionStorage after successful save
                sessionStorage.removeItem('annualReportFormData');
            }
        } catch (error) {
            console.error('Error saving to database:', error);
        }
    };

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                        <p className="text-green-100">
                            Your annual report order has been confirmed
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* What's Next Section */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Report Preparation</h3>
                                        <p className="text-gray-600 text-sm">
                                            Our team is now preparing your customized annual report based on your business information.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                        <Mail className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Email Delivery</h3>
                                        <p className="text-gray-600 text-sm">
                                            You'll receive your annual report via email at <span className="font-medium">{formData?.email}</span> within 2-3 business days.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-4 bg-amber-50 rounded-lg">
                                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Processing Time</h3>
                                        <p className="text-gray-600 text-sm">
                                            Expected delivery: 2-3 business days. You'll receive a confirmation email shortly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="border-t border-gray-200 pt-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Business Name:</span>
                                    <span className="font-medium text-gray-900">{formData?.businessName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium text-gray-900">{formData?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium text-gray-900 capitalize">
                                        {processor === 'stripe' ? 'Stripe' : 'Authorize.Net'}
                                    </span>
                                </div>
                                {transactionId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-medium text-gray-900 font-mono text-xs">{transactionId}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="font-semibold text-gray-900">Amount Paid:</span>
                                    <span className="font-bold text-xl text-green-600">$210.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleGoHome}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Return to Home
                            </button>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 text-center">
                                A confirmation email has been sent to your email address. If you have any questions, please contact our support team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}