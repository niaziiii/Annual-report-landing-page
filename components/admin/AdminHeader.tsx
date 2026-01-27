"use client";

import { Settings, LogOut, ShieldCheck, FileText } from "lucide-react";
import { useAppSettings } from "@/store/useAppSettings";

export default function AdminHeader({
    onOpenSettings,
    onLogout,
}: {
    onOpenSettings: () => void;
    onLogout: () => void;
}) {
    const { settings } = useAppSettings();

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                {/* LEFT — BRAND + CONTEXT */}
                <div className="flex items-center gap-4">
                    {/* Brand Mark */}
                    <div className="">
                        {settings?.app_logo ? (
                            <img src={settings.app_logo} className="object-contain max-h-16 max-w-16" />
                        ) : (
                            <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center text-white">
                                <FileText className="w-5 h-5" />
                            </div>

                        )}
                    </div>

                    {/* Brand Text */}
                    <div className="leading-tight">
                        <p className="text-[15px] font-semibold text-gray-900">
                            {settings?.app_name || "Annual Report System"}
                        </p>
                        <p className="text-xs text-gray-500">
                            Administration & Compliance Dashboard
                        </p>
                    </div>
                </div>

                {/* RIGHT — ACTIONS */}
                <div className="flex items-center gap-6">
                    {/* Divider */}
                    <div className="hidden sm:block h-6 w-px bg-gray-200" />

                    {/* Settings */}
                    <button
                        onClick={onOpenSettings}
                        className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer transition flex items-center gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        Application Settings
                    </button>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="text-sm cursor-pointer text-gray-600 hover:text-red-700 transition flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
