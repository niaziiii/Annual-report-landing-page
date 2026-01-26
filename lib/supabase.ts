// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


export interface AnnualReport {
    id: string;
    business_name: string;
    address: string;
    email: string;
    signature: string;
    payment_processor: string;
    created_at: string;
    transaction_id: string;
    payment_status: string;
    amount: any
}