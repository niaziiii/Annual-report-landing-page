"use client";

import { useEffect, useState } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { useAppSettings } from "@/store/useAppSettings";

export default function AppSettingsModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { settings, updateSettings } = useAppSettings();
    const [saving, setSaving] = useState(false);
    const [local, setLocal] = useState<any>(null);

    // ✅ SYNC LOCAL STATE WHEN MODAL OPENS OR SETTINGS CHANGE
    useEffect(() => {
        if (open && settings) {
            setLocal({ ...settings });
        }
    }, [open, settings]);

    if (!open || !local) return null;

    const save = async () => {
        setSaving(true);
        await updateSettings({
            app_name: local.app_name,
            app_logo: local.app_logo,
            app_description: local.app_description,
            active_payment_method: local.active_payment_method,
            report_price: local.report_price,
        });
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white max-h-[96vh] overflow-auto w-full max-w-2xl rounded-lg shadow-2xl">
                {/* HEADER */}
                <div className="flex items-center justify-between border-gray-200 px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Application Settings
                        </h2>
                        <p className="text-xs text-gray-500">
                            Global configuration for system
                        </p>
                    </div>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                    </button>
                </div>

                {/* BODY */}
                <div className="px-6 h-[70vh] overflow-auto py-6 space-y-6">
                    {/* App Name */}
                    <div>
                        <label className="label">Application Name</label>
                        <input
                            className="input"
                            value={local.app_name}
                            onChange={(e) =>
                                setLocal((s: any) => ({ ...s, app_name: e.target.value }))
                            }
                        />
                    </div>

                    {/* App Description */}
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            className="input resize-none"
                            rows={3}
                            value={local.app_description || ""}
                            onChange={(e) =>
                                setLocal((s: any) => ({
                                    ...s,
                                    app_description: e.target.value,
                                }))
                            }
                        />
                    </div>

                    {/* App Logo */}
                    <div>
                        <label className="label">Logo URL</label>
                        <input
                            className="input"
                            placeholder="https://example.com/logo.png"
                            value={local.app_logo || ""}
                            onChange={(e) =>
                                setLocal((s: any) => ({ ...s, app_logo: e.target.value }))
                            }
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="label">Active Payment Method</label>
                        <div className="space-y-3">
                            {[
                                { value: "stripe", label: "Stripe Only" },
                                { value: "authorize", label: "Authorize.Net Only" },
                                { value: "both", label: "Both (User Choice)" },
                            ].map((opt) => (
                                <label
                                    key={opt.value}
                                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer ${local.active_payment_method === opt.value
                                        ? "border-gray-900 bg-gray-50"
                                        : "border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        checked={local.active_payment_method === opt.value}
                                        onChange={() =>
                                            setLocal((s: any) => ({
                                                ...s,
                                                active_payment_method: opt.value,
                                            }))
                                        }
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            {opt.label}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Report Price */}
                    <div>
                        <label className="label">Report Price (USD)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                $
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                className="input !pl-10"
                                value={local.report_price}
                                onChange={(e) =>
                                    setLocal((s: any) => ({
                                        ...s,
                                        report_price: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 cursor-pointer py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="px-6 cursor-pointer py-2 bg-gray-900 text-white text-sm rounded-md disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* SHARED INPUT STYLES */}
            <style jsx>{`
        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
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
