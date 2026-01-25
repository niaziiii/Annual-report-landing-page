'use server'

import * as XLSX from 'xlsx';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
        // Validate the form data
        const validation = validateFormData(data);
        if (!validation.success) {
            return validation;
        }

        // Define the file path
        const dataDir = path.join(process.cwd(), 'data');
        const filePath = path.join(dataDir, 'annual-report-submissions.xlsx');

        // Ensure data directory exists
        if (!existsSync(dataDir)) {
            await mkdir(dataDir, { recursive: true });
        }

        let workbook: XLSX.WorkBook;
        let worksheet: XLSX.WorkSheet;
        let existingData: any[] = [];

        // Check if file exists and read existing data
        if (existsSync(filePath)) {
            const fileBuffer = await readFile(filePath);
            workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
            existingData = XLSX.utils.sheet_to_json(worksheet);
        } else {
            // Create new workbook if file doesn't exist
            workbook = XLSX.utils.book_new();
        }

        // Prepare new row with timestamp
        const newRow = {
            'Submission Date': new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }),
            'Business Name': data.businessName.trim(),
            'Address': data.address.trim(),
            'Email': data.email.trim().toLowerCase(),
            'Signature': data.signature.trim()
        };

        // Add new row to existing data
        existingData.push(newRow);

        // Create new worksheet with all data
        const newWorksheet = XLSX.utils.json_to_sheet(existingData);

        // Set column widths for better readability
        const columnWidths = [
            { wch: 20 }, // Submission Date
            { wch: 30 }, // Business Name
            { wch: 40 }, // Address
            { wch: 30 }, // Email
            { wch: 25 }  // Signature
        ];
        newWorksheet['!cols'] = columnWidths;

        // Replace the worksheet in workbook
        if (workbook.SheetNames.length > 0) {
            workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
        } else {
            XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Submissions');
        }

        // Write the file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        await writeFile(filePath, excelBuffer);

        return {
            success: true,
            message: 'Your request has been submitted successfully! Check your email for the annual report.'
        };

    } catch (error) {
        console.error('Error submitting form:', error);
        return {
            success: false,
            message: 'An error occurred while submitting your request. Please try again later.'
        };
    }
}