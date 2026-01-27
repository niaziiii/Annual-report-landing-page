"use client";

import { useEffect } from "react";
import { useAppSettings } from "@/store/useAppSettings";

export default function AppSettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const fetchSettings = useAppSettings((s) => s.fetchSettings);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return <>{children}</>;
}
