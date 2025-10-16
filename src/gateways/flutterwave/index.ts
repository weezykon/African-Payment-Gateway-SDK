import { PaymentGateway } from '../index';
import { Decimal } from 'decimal.js';
import { InitiateTransactionResponse, VerifyTransactionResponse, TransactionConfig } from '../../types';
import { PaymentGatewayError, TransactionVerificationError } from '../../errors';
import { DEFAULT_TRANSACTION_CONFIG } from '../../constants';
import axios from 'axios';

export class FlutterwaveGateway implements PaymentGateway {
  private readonly API_BASE_URL = 'https://api.flutterwave.com/v3';

  constructor(
    private _publicKey: string,
    private secretKey: string,
  ) {}

  async initiateTransaction(
    amount: Decimal,
    currency: string,
    customerEmail: string,
    reference: string,
    config?: TransactionConfig,
  ): Promise<InitiateTransactionResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/payments`,
        {
          tx_ref: reference,
          amount: amount.toNumber(),
          currency,
          redirect_url: config?.redirectUrl || 'https://example.com/callback',
          customer: {
            email: customerEmail,
          },
          customizations: {
            title: config?.customizations?.title || DEFAULT_TRANSACTION_CONFIG.title,
            description: config?.customizations?.description || DEFAULT_TRANSACTION_CONFIG.description,
            logo: config?.customizations?.logo,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === 'success') {
        return {
          message: response.data.message,
          reference: response.data.data.tx_ref,
          status: 'success',
          authorizationUrl: response.data.data.link,
        };
      } else {
        throw new PaymentGatewayError(response.data.message || 'Flutterwave transaction initiation failed');
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      throw new PaymentGatewayError(
        axiosError.response?.data?.message || axiosError.message || 'Unknown error',
        axiosError.response?.status?.toString(),
      );
    }
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/transactions/${reference}/verify`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === 'success') {
        const data = response.data.data;
        return {
          status: 'success',
          message: response.data.message,
          data: {
            amount: new Decimal(data.amount),
            currency: data.currency,
            reference: data.tx_ref,
            status: data.status,
            gatewayResponse: data,
            customer: {
              email: data.customer.email,
              firstName: data.customer.first_name,
              lastName: data.customer.last_name,
            },
          },
        };
      } else {
        throw new TransactionVerificationError(response.data.message || 'Flutterwave transaction verification failed');
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      throw new TransactionVerificationError(
        axiosError.response?.data?.message || axiosError.message || 'Unknown error',
        axiosError.response?.status?.toString(),
      );
    }
  }
}
