import { Decimal } from "decimal.js";

export interface PaymentGateway {
  initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<any>;
  verifyTransaction(reference: string): Promise<any>;
}
