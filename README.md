# African Payment Gateway SDK

This is a TypeScript SDK for integrating with Nigerian payment gateways like Paystack and Flutterwave.

## Features

- Unified interface for Paystack + Flutterwave APIs
- Transaction verification
- Webhook signature validation
- Decimal.js for financial precision
- Full TypeScript types
- Comprehensive error handling
- Zod for input validation

## Installation

```bash
npm install african-payment-gateway-sdk
# or
yarn add african-payment-gateway-sdk
```

## Usage

### Initializing the SDK

```typescript
import { AfricanPaymentGatewaySDK } from 'african-payment-gateway-sdk';
import { Decimal } from 'decimal.js';

// For Paystack
const paystackSDK = new AfricanPaymentGatewaySDK('paystack', { secretKey: 'YOUR_PAYSTACK_SECRET_KEY' });

// For Flutterwave
const flutterwaveSDK = new AfricanPaymentGatewaySDK('flutterwave', { publicKey: 'YOUR_FLUTTERWAVE_PUBLIC_KEY', secretKey: 'YOUR_FLUTTERWAVE_SECRET_KEY' });
```

### Initiating a Transaction

```typescript
const amount = new Decimal(100.50);
const currency = 'NGN';
const customerEmail = 'customer@example.com';
const reference = `txn_${Date.now()}`;

paystackSDK.initiateTransaction(amount, currency, customerEmail, reference)
  .then(response => {
    console.log('Transaction initiated:', response);
  })
  .catch(error => {
    console.error('Error initiating transaction:', error);
  });
```

### Verifying a Transaction

```typescript
const transactionReference = 'txn_123456789';

paystackSDK.verifyTransaction(transactionReference)
  .then(response => {
    console.log('Transaction verified:', response);
  })
  .catch(error => {
    console.error('Error verifying transaction:', error);
  });
```

### Webhook Signature Validation

```typescript
import { verifyPaystackWebhookSignature, verifyFlutterwaveWebhookSignature } from 'african-payment-gateway-sdk/dist/utils/webhook';

// For Paystack
const paystackSignature = 'x-paystack-signature-from-request-header';
const paystackPayload = { event: 'charge.success', data: { /* ... */ } };
const paystackSecret = 'YOUR_PAYSTACK_SECRET_KEY';

try {
  const isValid = verifyPaystackWebhookSignature(paystackSignature, paystackPayload, paystackSecret);
  console.log('Paystack webhook valid:', isValid);
} catch (error) {
  console.error('Paystack webhook validation failed:', error);
}

// For Flutterwave
const flutterwaveSignature = 'verif-hash-from-request-header';
const flutterwavePayload = { event: 'charge.completed', data: { /* ... */ } };
const flutterwaveSecret = 'YOUR_FLUTTERWAVE_SECRET_HASH';

try {
  const isValid = verifyFlutterwaveWebhookSignature(flutterwaveSignature, flutterwavePayload, flutterwaveSecret);
  console.log('Flutterwave webhook valid:', isValid);
} catch (error) {
  console.error('Flutterwave webhook validation failed:', error);
}
```

## Development

To build the project:

```bash
npm run build
```
