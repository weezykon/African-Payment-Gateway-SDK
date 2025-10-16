import { PaymentGateway } from '../index';
import { Decimal } from 'decimal.js';
import { InitiateTransactionResponse, VerifyTransactionResponse } from '../../types';
import { PaymentGatewayError, TransactionVerificationError } from '../../errors';
import axios from 'axios';

export class FlutterwaveGateway implements PaymentGateway {
  private readonly API_BASE_URL = 'https://api.flutterwave.com/v3';

  constructor(
    private publicKey: string,
    private secretKey: string,
  ) {}

  async initiateTransaction(
    amount: Decimal,
    currency: string,
    customerEmail: string,
    reference: string,
  ): Promise<InitiateTransactionResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/payments`,
        {
          tx_ref: reference,
          amount: amount.toNumber(),
          currency,
          redirect_url: 'https://webhook.site/', // This should be a configurable URL
          customer: {
            email: customerEmail,
          },
          customizations: {
            title: 'Payment for Order',
            description: 'Payment for items purchased',
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
    } catch (error: any) {
      throw new PaymentGatewayError(error.response?.data?.message || error.message, error.response?.status);
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
    } catch (error: any) {
      throw new TransactionVerificationError(error.response?.data?.message || error.message, error.response?.status);
    }
  }
}
