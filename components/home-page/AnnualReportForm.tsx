"use client"

import React, { useState } from 'react';
import { Mail, Building2, MapPin, FileText, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FormErrors {
    businessName?: string;
    address?: string;
    email?: string;
    signature?: string;
    paymentProcessor?: string;
}

type PaymentProcessor = 'stripe' | 'authorize';

export default function AnnualReportForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        businessName: '',
        address: '',
        email: '',
        signature: '',
        paymentProcessor: '' as PaymentProcessor | ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string>('');
    const [touched, setTouched] = useState({
        businessName: false,
        address: false,
        email: false,
        signature: false,
        paymentProcessor: false
    });

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'businessName':
                if (!value.trim()) return 'Business name is required';
                if (value.trim().length < 2) return 'Business name must be at least 2 characters';
                if (value.trim().length > 100) return 'Business name must not exceed 100 characters';
                break;

            case 'address':
                if (!value.trim()) return 'Business address is required';
                if (value.trim().length < 10) return 'Please provide a complete address (minimum 10 characters)';
                if (value.trim().length > 500) return 'Address must not exceed 500 characters';
                break;

            case 'email':
                if (!value.trim()) return 'Email address is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
                break;

            case 'signature':
                if (!value.trim()) return 'Signature is required';
                if (value.trim().length < 2) return 'Please enter your full name (minimum 2 characters)';
                if (value.trim().length > 100) return 'Signature must not exceed 100 characters';
                break;

            case 'paymentProcessor':
                if (!value) return 'Please select a payment method';
                break;
        }
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        setServerError('');

        if (touched[name as keyof typeof touched]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleProcessorChange = (processor: PaymentProcessor) => {
        setFormData(prev => ({ ...prev, paymentProcessor: processor }));
        setTouched(prev => ({ ...prev, paymentProcessor: true }));

        const error = validateField('paymentProcessor', processor);
        setErrors(prev => ({ ...prev, paymentProcessor: error }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateAllFields = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) {
                newErrors[key as keyof FormErrors] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);

        setTouched({
            businessName: true,
            address: true,
            email: true,
            signature: true,
            paymentProcessor: true
        });

        return isValid;
    };

    const handleProceedToPayment = () => {
        if (!validateAllFields()) {
            setServerError('Please fix all validation errors before proceeding to payment');
            return;
        }

        setIsSubmitting(true);

        // Store form data in sessionStorage for payment page
        sessionStorage.setItem('annualReportFormData', JSON.stringify(formData));

        // Navigate to payment page with processor info
        router.push(`/payment?processor=${formData.paymentProcessor}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                        <FileText className="w-12 h-12 text-blue-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Annual Report
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Access our comprehensive annual report. Fill out the form below to receive your copy and stay informed about our performance and achievements.
                    </p>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Your Annual Report</h2>

                    {/* Price Badge */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-semibold">Annual Report Price</p>
                            <p className="text-2xl font-bold text-blue-900">$210.00</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-600" />
                    </div>

                    {/* Server Error Alert */}
                    {serverError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{serverError}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Business Name */}
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Business Name *
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="businessName"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${errors.businessName && touched.businessName
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="Enter your business name"
                                />
                            </div>
                            {errors.businessName && touched.businessName && (
                                <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                Business Address *
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    rows={3}
                                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all resize-none ${errors.address && touched.address
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="Enter your complete business address"
                                />
                            </div>
                            {errors.address && touched.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${errors.email && touched.email
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="your.email@company.com"
                                />
                            </div>
                            {errors.email && touched.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Payment Processor Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Select Payment Method *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Stripe Option */}
                                <button
                                    type="button"
                                    onClick={() => handleProcessorChange('stripe')}
                                    className={`p-4 border-2 rounded-lg transition-all ${formData.paymentProcessor === 'stripe'
                                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">Stripe</p>
                                                <p className="text-xs text-gray-500">Credit/Debit Card</p>
                                            </div>
                                        </div>
                                        {formData.paymentProcessor === 'stripe' && (
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>

                                {/* Authorize.Net Option */}
                                <button
                                    type="button"
                                    onClick={() => handleProcessorChange('authorize')}
                                    className={`p-4 border-2 rounded-lg transition-all ${formData.paymentProcessor === 'authorize'
                                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">Authorize.Net</p>
                                                <p className="text-xs text-gray-500">Secure Payment</p>
                                            </div>
                                        </div>
                                        {formData.paymentProcessor === 'authorize' && (
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            </div>
                            {errors.paymentProcessor && touched.paymentProcessor && (
                                <p className="mt-2 text-sm text-red-600">{errors.paymentProcessor}</p>
                            )}
                        </div>

                        {/* Signature */}
                        <div>
                            <label htmlFor="signature" className="block text-sm font-semibold text-gray-700 mb-2">
                                Electronic Signature (Type your full name) *
                            </label>
                            <input
                                type="text"
                                id="signature"
                                name="signature"
                                value={formData.signature}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all font-serif text-lg ${errors.signature && touched.signature
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                placeholder=""
                                style={{ fontStyle: 'italic' }}
                            />
                            {errors.signature && touched.signature && (
                                <p className="mt-1 text-sm text-red-600">{errors.signature}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                By typing your name, you agree to purchase the annual report for $210.00
                            </p>
                        </div>

                        {/* Proceed to Payment Button */}
                        <button
                            onClick={handleProceedToPayment}
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Processing...' : 'Proceed to Payment ($210.00)'}
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    🔒 Your information is secure and encrypted. You will be redirected to a secure payment page.
                </p>
            </div>
        </div>
    );
}