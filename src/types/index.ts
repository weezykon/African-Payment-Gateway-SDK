import { Decimal } from "decimal.js";

export interface TransactionDetails {
  amount: Decimal;
  currency: string;
  customerEmail: string;
  reference: string;
  status: string;
  gatewayResponse: any;
}

export interface Customer {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface InitiateTransactionResponse {
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  status: string;
  message: string;
}

export interface VerifyTransactionResponse {
  status: string;
  message: string;
  data: {
    amount: Decimal;
    currency: string;
    reference: string;
    status: string;
    gatewayResponse: any;
    customer: Customer;
  };
}
