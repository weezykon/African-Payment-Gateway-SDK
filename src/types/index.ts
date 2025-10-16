import { Decimal } from 'decimal.js';

export interface PaystackCredentials {
  secretKey: string;
}

export interface FlutterwaveCredentials {
  publicKey: string;
  secretKey: string;
}

export type GatewayCredentials = PaystackCredentials | FlutterwaveCredentials;

export interface TransactionConfig {
  redirectUrl?: string;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface TransactionDetails {
  amount: Decimal;
  currency: string;
  customerEmail: string;
  reference: string;
  status: string;
  gatewayResponse: Record<string, unknown>;
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
    gatewayResponse: Record<string, unknown>;
    customer: Customer;
  };
}
