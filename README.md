# African Payment Gateway SDK

A robust TypeScript SDK for integrating African payment gateways (Paystack and Flutterwave) with comprehensive type safety, validation, and error handling.

> **Not yet published to npm.** Install directly from GitHub as shown below.

## Features

- 🔄 Unified interface for Paystack and Flutterwave APIs
- ✅ Transaction initiation and verification
- 🔐 Webhook signature validation
- 💰 Decimal.js for precise financial calculations
- 📘 Full TypeScript support with strict typing
- 🛡️ Comprehensive error handling
- ✨ Runtime validation with Zod
- ⚙️ Configurable transaction options (redirect URLs, customizations)

## Installation

```bash
npm install github:weezykon/African-Payment-Gateway-SDK decimal.js
# or
yarn add github:weezykon/African-Payment-Gateway-SDK decimal.js
```

## Quick Start

### Initializing the SDK

```typescript
import { AfricanPaymentGatewaySDK } from 'african-payment-gateway-sdk';
import { Decimal } from 'decimal.js';

// For Paystack
const paystackSDK = new AfricanPaymentGatewaySDK('paystack', {
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
});

// For Flutterwave
const flutterwaveSDK = new AfricanPaymentGatewaySDK('flutterwave', {
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
});
```

### Basic Transaction Flow

#### 1. Initiate a Transaction

```typescript
import { Decimal } from 'decimal.js';
import type { InitiateTransactionResponse } from 'african-payment-gateway-sdk';

async function initiatePayment() {
  try {
    const response: InitiateTransactionResponse = await paystackSDK.initiateTransaction(
      new Decimal(5000), // Amount in Naira
      'NGN',
      'customer@example.com',
      `txn_${Date.now()}`,
    );

    console.log('Authorization URL:', response.authorizationUrl);
    console.log('Reference:', response.reference);
    // Redirect user to response.authorizationUrl
  } catch (error) {
    if (error instanceof PaymentGatewayError) {
      console.error('Payment error:', error.message, error.code);
    }
  }
}
```

#### 2. Verify a Transaction

```typescript
import type { VerifyTransactionResponse } from 'african-payment-gateway-sdk';

async function verifyPayment(reference: string) {
  try {
    const response: VerifyTransactionResponse = await paystackSDK.verifyTransaction(reference);

    console.log('Payment Status:', response.data.status);
    console.log('Amount:', response.data.amount.toString());
    console.log('Customer:', response.data.customer.email);

    if (response.data.status === 'success') {
      // Payment successful - fulfill order
    }
  } catch (error) {
    if (error instanceof TransactionVerificationError) {
      console.error('Verification failed:', error.message);
    }
  }
}
```

## Advanced Usage

### Custom Transaction Configuration

```typescript
import type { TransactionConfig } from 'african-payment-gateway-sdk';

const config: TransactionConfig = {
  redirectUrl: 'https://yourdomain.com/payment/callback',
  customizations: {
    title: 'Premium Subscription',
    description: 'Monthly subscription payment',
    logo: 'https://yourdomain.com/logo.png',
  },
};

const response = await flutterwaveSDK.initiateTransaction(
  new Decimal(10000),
  'NGN',
  'user@example.com',
  `sub_${Date.now()}`,
  config,
);
```

### Webhook Integration

#### Express.js Example

```typescript
import express from 'express';
import { verifyPaystackWebhookSignature, verifyFlutterwaveWebhookSignature } from 'african-payment-gateway-sdk';

const app = express();

// Paystack Webhook
app.post('/webhooks/paystack', express.json(), (req, res) => {
  const signature = req.headers['x-paystack-signature'] as string;

  try {
    verifyPaystackWebhookSignature(signature, req.body, process.env.PAYSTACK_SECRET_KEY!);

    // Signature is valid - process the event
    const event = req.body;
    if (event.event === 'charge.success') {
      console.log('Payment successful:', event.data.reference);
      // Update your database, send confirmation email, etc.
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Invalid webhook signature');
    res.sendStatus(400);
  }
});

// Flutterwave Webhook
app.post('/webhooks/flutterwave', express.json(), (req, res) => {
  const signature = req.headers['verif-hash'] as string;

  try {
    verifyFlutterwaveWebhookSignature(signature, req.body, process.env.FLUTTERWAVE_SECRET_HASH!);

    // Signature is valid - process the event
    const event = req.body;
    if (event.event === 'charge.completed') {
      console.log('Payment completed:', event.data.tx_ref);
      // Update your database, send confirmation email, etc.
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Invalid webhook signature');
    res.sendStatus(400);
  }
});
```

### Error Handling

```typescript
import { PaymentGatewayError, TransactionVerificationError, WebhookVerificationError } from 'african-payment-gateway-sdk';

async function handlePayment() {
  try {
    const response = await paystackSDK.initiateTransaction(
      new Decimal(-100), // Invalid amount
      'NGN',
      'invalid-email', // Invalid email
      '',
    );
  } catch (error) {
    if (error instanceof PaymentGatewayError) {
      // Will show all validation errors
      console.error('Validation failed:', error.message);
      // e.g., "Invalid transaction initiation data: Amount must be a positive number, Invalid customer email address, Reference cannot be empty"
    }
  }
}
```

## TypeScript Support

The SDK is fully typed. Import types for better development experience:

```typescript
import type {
  PaystackCredentials,
  FlutterwaveCredentials,
  TransactionConfig,
  InitiateTransactionResponse,
  VerifyTransactionResponse,
  Customer,
} from 'african-payment-gateway-sdk';
```

## API Reference

### `AfricanPaymentGatewaySDK`

#### Constructor

```typescript
new AfricanPaymentGatewaySDK('paystack', credentials: PaystackCredentials)
new AfricanPaymentGatewaySDK('flutterwave', credentials: FlutterwaveCredentials)
```

#### Methods

**`initiateTransaction(amount, currency, customerEmail, reference, config?)`**

- `amount`: `Decimal` - Transaction amount
- `currency`: `string` - Currency code (e.g., 'NGN')
- `customerEmail`: `string` - Customer's email address
- `reference`: `string` - Unique transaction reference
- `config?`: `TransactionConfig` - Optional configuration
- Returns: `Promise<InitiateTransactionResponse>`

**`verifyTransaction(reference)`**

- `reference`: `string` - Transaction reference to verify
- Returns: `Promise<VerifyTransactionResponse>`

### Webhook Functions

**`verifyPaystackWebhookSignature(signature, payload, secret)`**

- `signature`: `string` - Signature from `x-paystack-signature` header
- `payload`: `Record<string, unknown>` - Webhook payload
- `secret`: `string` - Your Paystack secret key
- Returns: `boolean` - Throws `WebhookVerificationError` if invalid

**`verifyFlutterwaveWebhookSignature(signature, payload, secret)`**

- `signature`: `string` - Signature from `verif-hash` header
- `payload`: `Record<string, unknown>` - Webhook payload
- `secret`: `string` - Your Flutterwave secret hash
- Returns: `boolean` - Throws `WebhookVerificationError` if invalid

## Development

### Build the Project

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Lint Code

```bash
npm run lint
```

### Generate Documentation

```bash
npm run docs
```

Detailed API documentation will be generated in the `docs/api` directory.

## Best Practices

1. **Never expose secrets**: Store API keys in environment variables
2. **Validate webhooks**: Always verify webhook signatures before processing
3. **Use Decimal for amounts**: Never use JavaScript `Number` for financial calculations
4. **Handle errors properly**: Catch and handle specific error types
5. **Verify transactions**: Always verify transaction status on your backend, don't trust client-side results
6. **Use unique references**: Generate unique transaction references to prevent duplicates

## Design Decisions

**Why Decimal.js for amounts.** Payment amounts are money, and JavaScript's `number` type uses IEEE-754 floating point, which cannot represent most decimal fractions exactly (e.g. `0.1 + 0.2 !== 0.3`). Over many transactions, that imprecision compounds into real accounting discrepancies. `Decimal.js` represents amounts arbitrarily precisely and only drops down to `number` at the two points where the underlying gateway APIs require it (Paystack's kobo conversion, Flutterwave's raw amount), keeping the error surface as small as possible.

**Why Zod for validation.** Gateway credentials and transaction parameters (amount, currency, email, reference) are user-supplied and cross a trust boundary before hitting a third-party API. Zod lets those rules live as declarative schemas (`src/validation/index.ts`) instead of scattered `if` checks, gives descriptive per-field error messages for free, and keeps validation logic statically typed alongside the rest of the SDK.

**How errors are modelled.** All SDK errors extend a single `PaymentGatewayError` base class, with `TransactionVerificationError` and `WebhookVerificationError` as subclasses for more specific failure modes. This lets consumers either catch broadly (`catch (e) { if (e instanceof PaymentGatewayError) }`) or narrow to a specific failure type, while every error still carries an optional `code` (typically the HTTP status or a short machine-readable reason) for programmatic handling.

**Why one interface covers two gateways.** Paystack and Flutterwave expose different request/response shapes (amount units, field names, status strings) but solve the same two problems: initiate a transaction, verify a transaction. The `PaymentGateway` interface (`src/gateways/index.ts`) captures that shared contract, and each gateway's class adapts its own API quirks (kobo conversion, differing customization fields) behind it. Consumers write `initiateTransaction`/`verifyTransaction` once and can switch gateways by changing a single constructor argument.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
