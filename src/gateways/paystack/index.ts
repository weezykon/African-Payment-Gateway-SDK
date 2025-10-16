import { PaymentGateway } from '../index';
import { Decimal } from 'decimal.js';
import { InitiateTransactionResponse, VerifyTransactionResponse, TransactionConfig } from '../../types';
import { PaymentGatewayError, TransactionVerificationError } from '../../errors';
import { NAIRA_TO_KOBO } from '../../constants';
import axios from 'axios';

export class PaystackGateway implements PaymentGateway {
  private readonly API_BASE_URL = 'https://api.paystack.co';

  constructor(private secretKey: string) {}

  async initiateTransaction(
    amount: Decimal,
    currency: string,
    customerEmail: string,
    reference: string,
    config?: TransactionConfig,
  ): Promise<InitiateTransactionResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/transaction/initialize`,
        {
          amount: amount.times(NAIRA_TO_KOBO).toNumber(), // Paystack expects amount in kobo
          email: customerEmail,
          currency,
          reference,
          callback_url: config?.redirectUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status) {
        return {
          message: response.data.message,
          reference: response.data.data.reference,
          status: 'success',
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
        };
      } else {
        throw new PaymentGatewayError(response.data.message || 'Paystack transaction initiation failed');
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
      const response = await axios.get(`${this.API_BASE_URL}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status) {
        const data = response.data.data;
        return {
          status: 'success',
          message: response.data.message,
          data: {
            amount: new Decimal(data.amount).dividedBy(NAIRA_TO_KOBO), // Convert from kobo to actual amount
            currency: data.currency,
            reference: data.reference,
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
        throw new TransactionVerificationError(response.data.message || 'Paystack transaction verification failed');
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
