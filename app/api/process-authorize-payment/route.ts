// app/api/process-authorize-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { amount, cardData, formData } = await request.json();

        const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID!;
        const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY!;
        const isProduction = process.env.AUTHORIZE_NET_ENV === 'production';

        const endpoint = isProduction
            ? 'https://api.authorize.net/xml/v1/request.api'
            : 'https://apitest.authorize.net/xml/v1/request.api';

        // Construct Authorize.Net request
        const authorizeRequest = {
            createTransactionRequest: {
                merchantAuthentication: {
                    name: apiLoginId,
                    transactionKey: transactionKey,
                },
                transactionRequest: {
                    transactionType: 'authCaptureTransaction',
                    amount: amount.toFixed(2),
                    payment: {
                        creditCard: {
                            cardNumber: cardData.cardNumber,
                            expirationDate: `${cardData.expiryMonth}${cardData.expiryYear}`,
                            cardCode: cardData.cvv,
                        },
                    },
                    billTo: {
                        firstName: cardData.cardholderName.split(' ')[0],
                        lastName: cardData.cardholderName.split(' ').slice(1).join(' ') || 'Customer',
                        company: formData.businessName,
                        address: formData.address,
                        email: formData.email,
                    },
                    customerIP: request.headers.get('x-forwarded-for') || '127.0.0.1',
                    order: {
                        description: 'Annual Report Purchase',
                    },
                },
            },
        };

        // Make request to Authorize.Net
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(authorizeRequest),
        });

        const result = await response.json();

        // Check if transaction was successful
        if (
            result.messages.resultCode === 'Ok' &&
            result.transactionResponse &&
            result.transactionResponse.responseCode === '1'
        ) {
            return NextResponse.json({
                success: true,
                transactionId: result.transactionResponse.transId,
                message: 'Payment processed successfully',
            });
        } else {
            // Get error message
            const errorMessage =
                result.transactionResponse?.errors?.[0]?.errorText ||
                result.messages.message[0].text ||
                'Payment failed';

            return NextResponse.json({
                success: false,
                message: errorMessage,
            });
        }
    } catch (error: any) {
        console.error('Authorize.Net payment error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred while processing your payment',
            },
            { status: 500 }
        );
    }
}