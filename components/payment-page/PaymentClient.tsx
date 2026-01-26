"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import StripePayment from "@/components/home-page/payments/StripePayment";
import AuthorizePayment from "@/components/home-page/payments/AuthorizePayment";

export default function PaymentClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [formData, setFormData] = useState<any>(null);
    const [processor, setProcessor] = useState<string>("");

    useEffect(() => {
        const processorParam = searchParams.get("processor");
        setProcessor(processorParam || "");

        const savedData = sessionStorage.getItem("annualReportFormData");
        if (savedData) {
            setFormData(JSON.parse(savedData));
        } else {
            router.push("/");
        }
    }, [searchParams, router]);

    if (!formData || !processor) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
                Loading payment details…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Business Information
                </button>

                {/* Payment Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-6">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Secure Payment
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Invoice for <span className="font-medium">{formData.businessName}</span>
                        </p>
                    </div>

                    {/* Invoice Summary */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 text-gray-600">
                                        Annual Business Report (2024)
                                    </td>
                                    <td className="py-2 text-right font-medium">$210.00</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 text-gray-600">Processing Fee</td>
                                    <td className="py-2 text-right">$0.00</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-semibold">Total Due</td>
                                    <td className="py-3 text-right text-lg font-semibold">
                                        $210.00
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Method */}
                    <div className="p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-1">
                            Payment Details
                        </h2>
                        <p className="text-xs text-gray-500 mb-5">
                            {processor === "stripe"
                                ? "Processed securely via Stripe"
                                : "Processed securely via Authorize.Net"}
                        </p>

                        {processor === "stripe" && <StripePayment formData={formData} />}
                        {processor === "authorize" && <AuthorizePayment formData={formData} />}
                    </div>

                    {/* Billing Info */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-700 mb-3">
                            Billing Information
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>
                                <span className="font-medium">Business:</span>{" "}
                                {formData.businessName}
                            </p>
                            <p>
                                <span className="font-medium">Email:</span> {formData.email}
                            </p>
                            <p>
                                <span className="font-medium">Address:</span> {formData.address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <p className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Payments are secured with industry-standard encryption
                </p>
            </div>
        </div>
    );
}
