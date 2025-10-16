import { AfricanPaymentGatewaySDK } from '../index';
import { PaymentGatewayError } from '../errors';
import { Decimal } from 'decimal.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AfricanPaymentGatewaySDK', () => {
  const paystackSecretKey = 'test_paystack_secret';
  const flutterwavePublicKey = 'test_flutterwave_public';
  const flutterwaveSecretKey = 'test_flutterwave_secret';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with Paystack gateway', () => {
      const sdk = new AfricanPaymentGatewaySDK('paystack', { secretKey: paystackSecretKey });
      expect(sdk).toBeInstanceOf(AfricanPaymentGatewaySDK);
    });

    it('should initialize with Flutterwave gateway', () => {
      const sdk = new AfricanPaymentGatewaySDK('flutterwave', {
        publicKey: flutterwavePublicKey,
        secretKey: flutterwaveSecretKey,
      });
      expect(sdk).toBeInstanceOf(AfricanPaymentGatewaySDK);
    });

    it('should throw an error for invalid gateway type', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => new AfricanPaymentGatewaySDK('invalid', {})).toThrow(PaymentGatewayError);
      // @ts-expect-error - Testing invalid input
      expect(() => new AfricanPaymentGatewaySDK('invalid', {})).toThrow('Invalid gateway type provided.');
    });
  });

  describe('Paystack Transactions', () => {
    let paystackSDK: AfricanPaymentGatewaySDK;

    beforeEach(() => {
      paystackSDK = new AfricanPaymentGatewaySDK('paystack', { secretKey: paystackSecretKey });
    });

    it('should initiate a Paystack transaction successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Authorization URL created',
          data: {
            authorization_url: 'https://paystack.com/auth',
            access_code: 'xyz',
            reference: 'test_ref_123',
          },
        },
      });

      const amount = new Decimal(100);
      const currency = 'NGN';
      const customerEmail = 'test@example.com';
      const reference = 'test_ref_123';

      const result = await paystackSDK.initiateTransaction(amount, currency, customerEmail, reference);

      expect(result).toEqual({
        message: 'Authorization URL created',
        reference: 'test_ref_123',
        status: 'success',
        authorizationUrl: 'https://paystack.com/auth',
        accessCode: 'xyz',
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: 10000,
          email: customerEmail,
          currency,
          reference,
          callback_url: undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should verify a Paystack transaction successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Verification successful',
          data: {
            amount: 10000,
            currency: 'NGN',
            reference: 'test_ref_123',
            status: 'success',
            customer: { email: 'test@example.com', first_name: 'John', last_name: 'Doe' },
          },
        },
      });

      const reference = 'test_ref_123';
      const result = await paystackSDK.verifyTransaction(reference);

      expect(result).toEqual({
        status: 'success',
        message: 'Verification successful',
        data: {
          amount: new Decimal(100),
          currency: 'NGN',
          reference: 'test_ref_123',
          status: 'success',
          gatewayResponse: {
            amount: 10000,
            currency: 'NGN',
            reference: 'test_ref_123',
            status: 'success',
            customer: { email: 'test@example.com', first_name: 'John', last_name: 'Doe' },
          },
          customer: { email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
        },
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.paystack.co/transaction/verify/test_ref_123', {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw an error for invalid transaction initiation data (Paystack)', async () => {
      const amount = new Decimal(-100);
      const currency = 'NGN';
      const customerEmail = 'test@example.com';
      const reference = 'test_ref_123';

      await expect(paystackSDK.initiateTransaction(amount, currency, customerEmail, reference)).rejects.toThrow(
        'Invalid transaction initiation data',
      );
    });
  });

  describe('Flutterwave Transactions', () => {
    let flutterwaveSDK: AfricanPaymentGatewaySDK;

    beforeEach(() => {
      flutterwaveSDK = new AfricanPaymentGatewaySDK('flutterwave', {
        publicKey: flutterwavePublicKey,
        secretKey: flutterwaveSecretKey,
      });
    });

    it('should initiate a Flutterwave transaction successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Hosted Link',
          data: {
            link: 'https://flutterwave.com/pay',
            tx_ref: 'test_ref_456',
          },
        },
      });

      const amount = new Decimal(200);
      const currency = 'NGN';
      const customerEmail = 'test2@example.com';
      const reference = 'test_ref_456';

      const result = await flutterwaveSDK.initiateTransaction(amount, currency, customerEmail, reference);

      expect(result).toEqual({
        message: 'Hosted Link',
        reference: 'test_ref_456',
        status: 'success',
        authorizationUrl: 'https://flutterwave.com/pay',
      });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: reference,
          amount: amount.toNumber(),
          currency,
          redirect_url: 'https://example.com/callback',
          customer: {
            email: customerEmail,
          },
          customizations: {
            title: 'Payment for Order',
            description: 'Payment for items purchased',
            logo: undefined,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${flutterwaveSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should verify a Flutterwave transaction successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Transaction fetched successfully',
          data: {
            amount: 200,
            currency: 'NGN',
            tx_ref: 'test_ref_456',
            status: 'successful',
            customer: { email: 'test2@example.com', first_name: 'Jane', last_name: 'Smith' },
          },
        },
      });

      const reference = 'test_ref_456';
      const result = await flutterwaveSDK.verifyTransaction(reference);

      expect(result).toEqual({
        status: 'success',
        message: 'Transaction fetched successfully',
        data: {
          amount: new Decimal(200),
          currency: 'NGN',
          reference: 'test_ref_456',
          status: 'successful',
          gatewayResponse: {
            amount: 200,
            currency: 'NGN',
            tx_ref: 'test_ref_456',
            status: 'successful',
            customer: { email: 'test2@example.com', first_name: 'Jane', last_name: 'Smith' },
          },
          customer: { email: 'test2@example.com', firstName: 'Jane', lastName: 'Smith' },
        },
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.flutterwave.com/v3/transactions/test_ref_456/verify', {
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw an error for invalid transaction initiation data (Flutterwave)', async () => {
      const amount = new Decimal(-200);
      const currency = 'NGN';
      const customerEmail = 'test2@example.com';
      const reference = 'test_ref_456';

      await expect(flutterwaveSDK.initiateTransaction(amount, currency, customerEmail, reference)).rejects.toThrow(
        'Invalid transaction initiation data',
      );
    });
  });
});
