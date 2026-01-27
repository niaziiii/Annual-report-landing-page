"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type PaymentMethod = "stripe" | "authorize" | "both";

export interface AppSettings {
    id: string;
    app_name: string;
    app_logo: string | null;
    app_description: string | null;
    active_payment_method: PaymentMethod;
    report_price: number;
}

interface AppSettingsStore {
    settings: AppSettings | null;
    loading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (data: Partial<AppSettings>) => Promise<void>;
}

export const useAppSettings = create<AppSettingsStore>((set) => ({
    settings: null,
    loading: true,

    fetchSettings: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from("app_settings")
            .select("*")
            .single();

        if (!error && data) {
            set({
                settings: {
                    ...data,
                    report_price: Number(data.report_price),
                },
            });
        }

        set({ loading: false });
    },

    updateSettings: async (updates) => {
        const { data } = await supabase.from("app_settings").select("id").single();
        if (!data) return;

        await supabase
            .from("app_settings")
            .update(updates)
            .eq("id", data.id);

        set((state) => ({
            settings: state.settings ? { ...state.settings, ...updates } : null,
        }));
    },
}));
