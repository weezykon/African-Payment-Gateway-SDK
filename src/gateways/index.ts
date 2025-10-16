import { Decimal } from "decimal.js";
import { InitiateTransactionResponse, VerifyTransactionResponse } from "../types";

export interface PaymentGateway {
  initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<InitiateTransactionResponse>;
  verifyTransaction(reference: string): Promise<VerifyTransactionResponse>;
}
