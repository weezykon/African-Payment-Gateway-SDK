import { PaymentGateway } from './gateways';
import { PaystackGateway } from './gateways/paystack';
import { FlutterwaveGateway } from './gateways/flutterwave';
import { Decimal } from 'decimal.js';
import { InitiateTransactionResponse, VerifyTransactionResponse } from './types';
import { PaymentGatewayError } from './errors';
import { initiateTransactionSchema, verifyTransactionSchema } from './validation';

export class AfricanPaymentGatewaySDK {
  private gateway: PaymentGateway;

  constructor(gatewayType: 'paystack' | 'flutterwave', credentials: any) {
    if (gatewayType === 'paystack') {
      this.gateway = new PaystackGateway(credentials.secretKey);
    } else if (gatewayType === 'flutterwave') {
      this.gateway = new FlutterwaveGateway(credentials.publicKey, credentials.secretKey);
    } else {
      throw new PaymentGatewayError('Invalid gateway type provided.');
    }
  }

  public async initiateTransaction(
    amount: Decimal,
    currency: string,
    customerEmail: string,
    reference: string,
  ): Promise<InitiateTransactionResponse> {
    const validationResult = initiateTransactionSchema.safeParse({
      amount: amount.toNumber(), // Zod expects number for validation
      currency,
      customerEmail,
      reference,
    });

    if (!validationResult.success) {
      throw new PaymentGatewayError('Invalid transaction initiation data', validationResult.error.issues[0].message);
    }

    return this.gateway.initiateTransaction(amount, currency, customerEmail, reference);
  }

  public async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    const validationResult = verifyTransactionSchema.safeParse({ reference });

    if (!validationResult.success) {
      throw new PaymentGatewayError('Invalid transaction verification data', validationResult.error.issues[0].message);
    }

    return this.gateway.verifyTransaction(reference);
  }
}
