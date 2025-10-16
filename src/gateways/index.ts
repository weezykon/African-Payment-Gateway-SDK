import { Decimal } from 'decimal.js';
import { InitiateTransactionResponse, VerifyTransactionResponse, TransactionConfig } from '../types';

export interface PaymentGateway {
  initiateTransaction(
    amount: Decimal,
    currency: string,
    customerEmail: string,
    reference: string,
    config?: TransactionConfig,
  ): Promise<InitiateTransactionResponse>;
  verifyTransaction(reference: string): Promise<VerifyTransactionResponse>;
}
