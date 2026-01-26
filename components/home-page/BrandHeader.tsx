"use client";

import { FileText, ShieldCheck } from "lucide-react";

export default function BrandHeader() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Left: Brand */}
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-900 text-white">
                        <FileText className="w-5 h-5" />
                    </div>

                    {/* Text */}
                    <div className="leading-tight">
                        <p className="text-base font-semibold text-gray-900">
                            Annual Reports Service
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Official Business Compliance Documents
                        </div>
                    </div>
                </div>

                {/* Right: Trust Badge */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    Secure & Encrypted
                </div>
            </div>
        </header>
    );
}
