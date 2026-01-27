"use client"

import { useAppSettings } from "@/store/useAppSettings";
import AnnualReportForm from "./AnnualReportForm";
import BrandHeader from "./BrandHeader";
import { Loader2 } from "lucide-react";

export default function HomePage() {
    const { loading } = useAppSettings()

    if (loading) {
        return (
            <div className="bg-slate-50 py-20 px-4 h-screen flex items-center">
                <div className="max-w-4xl mx-auto flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }
    return <div>
        <div className="min-h-screen">
            <BrandHeader />

            {/* Form Section with ID for smooth scroll */}
            <div id="annual-report-form">
                <AnnualReportForm />
            </div>
        </div>
    </div>
}