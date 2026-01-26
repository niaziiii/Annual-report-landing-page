// app/api/save-annual-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Insert into Supabase with payment information
        const { data: insertedData, error } = await supabase
            .from('annual_reports')
            .insert([
                {
                    business_name: data.businessName,
                    address: data.address,
                    email: data.email.toLowerCase(),
                    signature: data.signature,
                    payment_processor: data.paymentProcessor,
                    transaction_id: data.transactionId || null,
                    payment_status: data.paymentStatus,
                    amount: data.amount,
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Failed to save data to database');
        }

        return NextResponse.json({
            success: true,
            message: 'Annual report order saved successfully',
            data: insertedData,
        });
    } catch (error: any) {
        console.error('Error saving annual report:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'An error occurred while saving the order',
            },
            { status: 500 }
        );
    }
}