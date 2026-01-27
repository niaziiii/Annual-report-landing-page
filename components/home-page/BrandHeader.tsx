"use client";

import { FileText, ShieldCheck } from "lucide-react";
import { useAppSettings } from "@/store/useAppSettings";

export default function BrandHeader() {
    const { settings } = useAppSettings();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="">
                        {settings?.app_logo ? (
                            <img src={settings.app_logo} className="object-contain max-h-16 max-w-16" />
                        ) : (
                            <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center text-white">
                                <FileText className="w-5 h-5" />
                            </div>

                        )}
                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">
                            {settings?.app_name || "Annual Reports"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {settings?.app_description || "Official Business Compliance"}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4" />
                    Secure & Encrypted
                </div>
            </div>
        </header>
    );
}
