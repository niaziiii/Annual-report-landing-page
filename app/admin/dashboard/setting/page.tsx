"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Settings, Loader2, CheckCircle, AlertCircle, Upload, CreditCard, ArrowLeft } from "lucide-react";

interface AppSettings {
    id: string;
    app_name: string;
    app_logo: string | null;
    app_description: string | null;
    active_payment_method: 'stripe' | 'authorize' | 'both';
    report_price: number;
}

export default function AdminSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [settings, setSettings] = useState<AppSettings>({
        id: "",
        app_name: "Annual Report System",
        app_logo: null,
        app_description: "",
        active_payment_method: "stripe",
        report_price: 210.00,
    });

    useEffect(() => {
        checkAuth();
        fetchSettings();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) router.push("/admin");
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("app_settings")
                .select("*")
                .single();

            if (error) throw error;

            if (data) {
                setSettings({
                    ...data,
                    report_price: parseFloat(data.report_price),
                });
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            setError("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: name === "report_price" ? parseFloat(value) : value,
        }));
        setSuccess(false);
        setError("");
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess(false);

        try {
            const { error } = await supabase
                .from("app_settings")
                .update({
                    app_name: settings.app_name,
                    app_logo: settings.app_logo,
                    app_description: settings.app_description,
                    active_payment_method: settings.active_payment_method,
                    report_price: settings.report_price,
                })
                .eq("id", settings.id);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Error saving settings:", err);
            setError(err.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 text-white rounded-md flex items-center justify-center">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                Application Settings
                            </h1>
                            <p className="text-xs text-gray-500">
                                Configure your annual report system
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Success/Error Messages */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Business Information
                </button>
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <p className="text-sm text-green-700">Settings saved successfully!</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Settings Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                    {/* App Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Application Name
                        </label>
                        <input
                            type="text"
                            name="app_name"
                            value={settings.app_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                            placeholder="Annual Report System"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This name will appear in the header and emails
                        </p>
                    </div>

                    {/* App Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo URL
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="url"
                                name="app_logo"
                                value={settings.app_logo || ""}
                                onChange={handleChange}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                                placeholder="https://example.com/logo.png"
                            />
                            {settings.app_logo && (
                                <div className="w-12 h-12 border border-gray-300 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                                    <img
                                        src={settings.app_logo}
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Enter a URL to your logo image (recommended: 200x200px)
                        </p>
                    </div>

                    {/* App Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="app_description"
                            value={settings.app_description || ""}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
                            placeholder="Professional business annual reports delivered in 2-3 business days"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Brief description shown on the landing page
                        </p>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Active Payment Method
                        </label>
                        <div className="space-y-3">
                            {[
                                { value: 'stripe', label: 'Stripe Only', desc: 'Accept payments via Stripe' },
                                { value: 'authorize', label: 'Authorize.Net Only', desc: 'Accept payments via Authorize.Net' },
                                { value: 'both', label: 'Both Methods', desc: 'Let customers choose their payment method' },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition ${settings.active_payment_method === option.value
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="active_payment_method"
                                        value={option.value}
                                        checked={settings.active_payment_method === option.value}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-gray-600" />
                                            <span className="font-medium text-gray-900">{option.label}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            This controls which payment options appear on the public form
                        </p>
                    </div>

                    {/* Report Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report Price (USD)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                name="report_price"
                                value={settings.report_price}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Price customers will pay for the annual report
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="text-sm text-gray-600 hover:text-gray-900 transition"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}