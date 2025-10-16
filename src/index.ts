import { PaymentGateway } from './gateways';
import { PaystackGateway } from './gateways/paystack';
import { FlutterwaveGateway } from './gateways/flutterwave';
import { Decimal } from 'decimal.js';
import {
  InitiateTransactionResponse,
  VerifyTransactionResponse,
  PaystackCredentials,
  FlutterwaveCredentials,
  TransactionConfig,
} from './types';
import { PaymentGatewayError } from './errors';
import { initiateTransactionSchema, verifyTransactionSchema } from './validation';

export class AfricanPaymentGatewaySDK {
  private gateway: PaymentGateway;

  constructor(gatewayType: 'paystack', credentials: PaystackCredentials);
  constructor(gatewayType: 'flutterwave', credentials: FlutterwaveCredentials);
  constructor(
    gatewayType: 'paystack' | 'flutterwave',
    credentials: PaystackCredentials | FlutterwaveCredentials,
  ) {
    if (gatewayType === 'paystack') {
      const paystackCreds = credentials as PaystackCredentials;
      this.gateway = new PaystackGateway(paystackCreds.secretKey);
    } else if (gatewayType === 'flutterwave') {
      const flutterwaveCreds = credentials as FlutterwaveCredentials;
      this.gateway = new FlutterwaveGateway(flutterwaveCreds.publicKey, flutterwaveCreds.secretKey);
    } else {
      throw new PaymentGatewayError('Invalid gateway type provided.');
    }
  }

  public async initiateTransaction(
    amount: Decimal,
    currency: string,
    customerEmail: string,
    reference: string,
    config?: TransactionConfig,
  ): Promise<InitiateTransactionResponse> {
    const validationResult = initiateTransactionSchema.safeParse({
      amount: amount.toNumber(), // Zod expects number for validation
      currency,
      customerEmail,
      reference,
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
      throw new PaymentGatewayError('Invalid transaction initiation data', errorMessages);
    }

    return this.gateway.initiateTransaction(amount, currency, customerEmail, reference, config);
  }

  public async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    const validationResult = verifyTransactionSchema.safeParse({ reference });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
      throw new PaymentGatewayError('Invalid transaction verification data', errorMessages);
    }

    return this.gateway.verifyTransaction(reference);
  }
}

// Export types for consumers
export * from './types';
export * from './errors';
export * from './utils/webhook';
