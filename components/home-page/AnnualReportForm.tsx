"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Mail,
    Building2,
    MapPin,
    AlertCircle,
    CreditCard,
    CheckCircle,
    PenLine,
    Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/store/useAppSettings";

interface FormErrors {
    businessName?: string;
    address?: string;
    email?: string;
    signature?: string;
    paymentProcessor?: string;
}

type PaymentProcessor = "stripe" | "authorize";

export default function AnnualReportForm() {
    const router = useRouter();
    const { settings, loading } = useAppSettings();

    // ✅ derive directly from zustand
    const price = settings?.report_price ?? 210;
    const activePayment = settings?.active_payment_method ?? "stripe";

    const [formData, setFormData] = useState({
        businessName: "",
        address: "",
        email: "",
        signature: "",
        paymentProcessor: "" as PaymentProcessor | "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState({
        businessName: false,
        address: false,
        email: false,
        signature: false,
        paymentProcessor: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    // ✅ payment selection rules derived from settings (single source of truth)
    const shouldShowPaymentSelection = activePayment === "both";

    const availablePaymentMethods: PaymentProcessor[] = useMemo(() => {
        if (activePayment === "both") return ["stripe", "authorize"];
        return [activePayment as PaymentProcessor];
    }, [activePayment]);

    // ✅ auto-select payment method when settings load OR when admin changes it
    useEffect(() => {
        if (!settings) return;

        if (settings.active_payment_method !== "both") {
            const method = settings.active_payment_method as PaymentProcessor;
            setFormData((prev) => ({
                ...prev,
                paymentProcessor: method,
            }));

            // clear any old error/touched for payment
            setErrors((prev) => ({ ...prev, paymentProcessor: "" }));
            setTouched((prev) => ({ ...prev, paymentProcessor: false }));
        } else {
            // if "both" and user previously selected, keep it
            // if empty, don't force select (so user explicitly picks)
            setFormData((prev) => ({
                ...prev,
                paymentProcessor: prev.paymentProcessor || "",
            }));
        }
    }, [settings]);

    // =========================
    // VALIDATION
    // =========================
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case "businessName":
                if (!value.trim()) return "Business name is required";
                if (value.trim().length < 2) return "Business name must be at least 2 characters";
                break;

            case "address":
                if (!value.trim()) return "Business address is required";
                if (value.trim().length < 10) return "Please provide a complete address";
                break;

            case "email":
                if (!value.trim()) return "Email address is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
                    return "Please enter a valid email address";
                break;

            case "signature":
                if (!value.trim()) return "Signature is required";
                if (value.trim().length < 2) return "Please enter your full legal name";
                break;

            case "paymentProcessor":
                if (shouldShowPaymentSelection && !value) return "Please select a payment method";
                break;
        }
        return "";
    };

    const validateAllFields = (): boolean => {
        const newErrors: FormErrors = {};
        let valid = true;

        const keys = Object.keys(formData) as Array<keyof typeof formData>;

        keys.forEach((key) => {
            // Skip payment processor validation if it's auto-selected (single payment method)
            if (key === "paymentProcessor" && !shouldShowPaymentSelection) {
                return;
            }

            const error = validateField(key, String(formData[key] ?? ""));
            if (error) {
                newErrors[key as keyof FormErrors] = error;
                valid = false;
            }
        });

        setErrors(newErrors);
        setTouched({
            businessName: true,
            address: true,
            email: true,
            signature: true,
            paymentProcessor: true,
        });

        return valid;
    };

    // =========================
    // HANDLERS
    // =========================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setServerError("");

        if (touched[name as keyof typeof touched]) {
            setErrors((prev) => ({
                ...prev,
                [name]: validateField(name, value),
            }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleProcessorChange = (processor: PaymentProcessor) => {
        setFormData((prev) => ({ ...prev, paymentProcessor: processor }));
        setTouched((prev) => ({ ...prev, paymentProcessor: true }));
        setErrors((prev) => ({
            ...prev,
            paymentProcessor: validateField("paymentProcessor", processor),
        }));
    };

    const handleProceedToPayment = () => {
        if (!validateAllFields()) {
            setServerError("Please correct the errors below before continuing.");
            return;
        }

        setIsSubmitting(true);

        sessionStorage.setItem("annualReportFormData", JSON.stringify({ ...formData, amount: price }));

        // ✅ If payment method is auto-selected, this will already be set.
        router.push(`/payment?processor=${formData.paymentProcessor}`);
    };

    // =========================
    // LOADING UI
    // =========================
    if (loading) {
        return (
            <div className="bg-slate-50 py-20 px-4">
                <div className="max-w-4xl mx-auto flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    // If settings failed to load (rare), still render with fallbacks
    // (price fallback already handled)
    // =========================
    // UI
    // =========================
    return (
        <div className="bg-slate-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                    Annual Business Report
                </h1>

                <p className="mt-3 text-base text-gray-600 max-w-3xl">
                    Complete the form below to securely generate and purchase your legally formatted annual business report.
                </p>

                {/* Form Card */}
                <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Business Information
                    </h2>

                    {serverError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md items-center flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-700">{serverError}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Business Name */}
                        <Field
                            label="Business Name"
                            icon={<Building2 className="w-5 h-5 text-gray-400" />}
                            error={errors.businessName}
                            touched={touched.businessName}
                        >
                            <input
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input"
                                placeholder="Legal business name as registered"
                            />
                        </Field>

                        {/* Address */}
                        <Field
                            label="Business Address"
                            icon={<MapPin className="w-5 h-5 text-gray-400" />}
                            error={errors.address}
                            touched={touched.address}
                            alignment="start"
                        >
                            <textarea
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input resize-none"
                                placeholder="Street address, city, state, postal code, country"
                            />
                        </Field>

                        {/* Email */}
                        <Field
                            label="Email Address"
                            icon={<Mail className="w-5 h-5 text-gray-400" />}
                            error={errors.email}
                            touched={touched.email}
                        >
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input"
                                placeholder="business@email.com"
                            />
                        </Field>

                        {/* Payment Method - Only show if "both" */}
                        {shouldShowPaymentSelection && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Payment Method
                                </label>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {availablePaymentMethods.map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => handleProcessorChange(method)}
                                            className={`p-4 border rounded-md text-left transition ${formData.paymentProcessor === method
                                                ? "border-gray-900 bg-gray-50"
                                                : "border-gray-300 hover:border-gray-400"
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                        <CreditCard className="w-5 h-5 text-gray-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">
                                                            {method === "stripe" ? "Stripe" : "Authorize.Net"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Secure card payment</p>
                                                    </div>
                                                </div>

                                                {formData.paymentProcessor === method && (
                                                    <CheckCircle className="w-5 h-5 text-gray-900" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {errors.paymentProcessor && touched.paymentProcessor && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.paymentProcessor}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Payment Method (Read-only) - if only one method active */}
                        {!shouldShowPaymentSelection && (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Payment Method:{" "}
                                            {formData.paymentProcessor === "stripe" ? "Stripe" : "Authorize.Net"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Secure card payment processing
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Signature */}
                        <div>
                            <Field
                                label="Electronic Signature (Full Legal Name)"
                                icon={<PenLine className="w-5 h-5 text-gray-400" />}
                                error={errors.signature}
                                touched={touched.signature}
                            >
                                <input
                                    name="signature"
                                    value={formData.signature}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="input font-serif italic"
                                    placeholder="Full legal name (e.g. John A. Smith)"
                                />
                            </Field>

                            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                                This service is provided by a third-party company and is not endorsed by, or affiliated with, any government agency.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleProceedToPayment}
                            disabled={isSubmitting}
                            className="w-full cursor-pointer bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-md transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Processing..." : `Proceed to Payment ($${price.toFixed(2)})`}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-8">
                    All data is transmitted securely using industry-standard encryption.
                </p>
            </div>

            {/* Shared input styles */}
            <style jsx>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          outline: none;
        }
        .input:focus {
          border-color: #111827;
          box-shadow: 0 0 0 1px #111827;
        }
      `}</style>
        </div>
    );
}

// =========================
// FIELD WRAPPER
// =========================
function Field({
    label,
    icon,
    error,
    touched,
    children,
    alignment,
}: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            <div className="relative">
                <div
                    className={`absolute left-3 ${alignment === "start"
                        ? "top-4 -translate-y-1"
                        : "top-1/2 -translate-y-1/2"
                        }`}
                >
                    {icon}
                </div>

                {children}
            </div>

            {error && touched && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
