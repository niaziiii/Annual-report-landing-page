"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    CheckCircle,
    FileText,
    Mail,
    Clock,
    Home,
    ShieldCheck,
} from "lucide-react";

export default function SuccessClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [processor, setProcessor] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [formData, setFormData] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const proc = searchParams.get("processor") || "";
        const txn = searchParams.get("transaction") || "";

        setProcessor(proc);
        setTransactionId(txn);

        const savedData = sessionStorage.getItem("annualReportFormData");
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setFormData(parsed);
            saveToDatabase(parsed, proc, txn);
        }
    }, [searchParams]);

    const saveToDatabase = async (data: any, proc: string, txn: string) => {
        try {
            const res = await fetch("/api/save-annual-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    paymentProcessor: proc,
                    transactionId: txn,
                    paymentStatus: "completed",
                    amount: 210.0,
                }),
            });

            const result = await res.json();
            if (result.success) {
                setSaved(true);
                sessionStorage.removeItem("annualReportFormData");
            }
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Confirmation Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-6 text-center">
                        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>

                        <h1 className="text-xl font-semibold text-gray-900">
                            Payment Confirmed
                        </h1>

                        <p className="text-sm text-gray-600 mt-1">
                            Your annual business report order has been successfully submitted.
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                            Order Summary
                        </h2>

                        <div className="space-y-2 text-sm text-gray-700">
                            <Row label="Business Name" value={formData?.businessName} />
                            <Row label="Email" value={formData?.email} />
                            <Row
                                label="Payment Method"
                                value={processor === "stripe" ? "Stripe" : "Authorize.Net"}
                            />
                            {transactionId && (
                                <Row
                                    label="Transaction ID"
                                    value={transactionId}
                                    mono
                                />
                            )}
                            <Row label="Amount Paid" value="$210.00" bold />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* Next Steps */}
                    <div className="p-6 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            What Happens Next
                        </h3>

                        <div className="space-y-4 text-sm text-gray-600">
                            <Step
                                icon={<FileText className="w-4 h-4" />}
                                title="Report Preparation"
                                text="Our compliance team is preparing your annual business report."
                            />
                            <Step
                                icon={<Mail className="w-4 h-4" />}
                                title="Email Delivery"
                                text={`Your report will be delivered to ${formData?.email} within 2–3 business days.`}
                            />
                            <Step
                                icon={<Clock className="w-4 h-4" />}
                                title="Processing Time"
                                text="You will receive a confirmation email shortly."
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-200">
                        <button
                            onClick={() => router.push("/")}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-md transition flex items-center justify-center"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return to Home
                        </button>

                        <p className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4" />
                            This transaction was securely processed and recorded.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------- helpers ---------------- */

function Row({
    label,
    value,
    mono,
    bold,
}: {
    label: string;
    value?: string;
    mono?: boolean;
    bold?: boolean;
}) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span
                className={[
                    mono ? "font-mono text-xs" : "",
                    bold ? "font-semibold text-gray-900" : "text-gray-900",
                ].join(" ")}
            >
                {value || "-"}
            </span>
        </div>
    );
}

function Step({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="mt-0.5 text-gray-400">{icon}</div>
            <div>
                <p className="font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-600">{text}</p>
            </div>
        </div>
    );
}
