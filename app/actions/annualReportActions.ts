'use server'

import { supabase } from '@/lib/supabase';

interface AnnualReportData {
    businessName: string;
    address: string;
    email: string;
    signature: string;
}

interface ActionResponse {
    success: boolean;
    message: string;
    errors?: {
        businessName?: string;
        address?: string;
        email?: string;
        signature?: string;
    };
}

// Validation helper
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateFormData(data: AnnualReportData): ActionResponse {
    const errors: ActionResponse['errors'] = {};

    // Business Name validation
    if (!data.businessName || data.businessName.trim().length === 0) {
        errors.businessName = 'Business name is required';
    } else if (data.businessName.trim().length < 2) {
        errors.businessName = 'Business name must be at least 2 characters';
    } else if (data.businessName.trim().length > 100) {
        errors.businessName = 'Business name must not exceed 100 characters';
    }

    // Address validation
    if (!data.address || data.address.trim().length === 0) {
        errors.address = 'Business address is required';
    } else if (data.address.trim().length < 10) {
        errors.address = 'Please provide a complete address (minimum 10 characters)';
    } else if (data.address.trim().length > 500) {
        errors.address = 'Address must not exceed 500 characters';
    }

    // Email validation
    if (!data.email || data.email.trim().length === 0) {
        errors.email = 'Email address is required';
    } else if (!validateEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // Signature validation
    if (!data.signature || data.signature.trim().length === 0) {
        errors.signature = 'Signature is required';
    } else if (data.signature.trim().length < 2) {
        errors.signature = 'Please enter your full name (minimum 2 characters)';
    } else if (data.signature.trim().length > 100) {
        errors.signature = 'Signature must not exceed 100 characters';
    }

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: 'Please fix the validation errors',
            errors
        };
    }

    return { success: true, message: 'Validation passed' };
}

export async function submitAnnualReportForm(data: AnnualReportData): Promise<ActionResponse> {
    try {
        console.log('📝 Starting form submission...');

        // Validate the form data
        const validation = validateFormData(data);
        if (!validation.success) {
            return validation;
        }

        // Insert into Supabase
        console.log('💾 Saving to Supabase...');
        const { data: insertedData, error } = await supabase
            .from('annual_reports')
            .insert([
                {
                    business_name: data.businessName.trim(),
                    address: data.address.trim(),
                    email: data.email.trim().toLowerCase(),
                    signature: data.signature.trim()
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Failed to save data to database');
        }

        console.log('✅ Data saved successfully!', insertedData);

        return {
            success: true,
            message: 'Your request has been submitted successfully! Check your email for the annual report.'
        };

    } catch (error) {
        console.error('❌ Error submitting form:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An error occurred while submitting your request. Please try again later.'
        };
    }
}