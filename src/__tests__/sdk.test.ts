import { AfricanPaymentGatewaySDK } from '../index';
import { PaymentGatewayError, TransactionVerificationError } from '../errors';
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

  describe('Error paths', () => {
    let paystackSDK: AfricanPaymentGatewaySDK;
    let flutterwaveSDK: AfricanPaymentGatewaySDK;

    beforeEach(() => {
      paystackSDK = new AfricanPaymentGatewaySDK('paystack', { secretKey: paystackSecretKey });
      flutterwaveSDK = new AfricanPaymentGatewaySDK('flutterwave', {
        publicKey: flutterwavePublicKey,
        secretKey: flutterwaveSecretKey,
      });
    });

    const validArgs = {
      amount: new Decimal(100),
      currency: 'NGN',
      email: 'test@example.com',
      reference: 'ref_1',
    };

    describe('Paystack', () => {
      it('throws PaymentGatewayError when the API reports initiation failure', async () => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { status: false, message: 'Insufficient funds' },
        });

        await expect(
          paystackSDK.initiateTransaction(validArgs.amount, validArgs.currency, validArgs.email, validArgs.reference),
        ).rejects.toThrow('Insufficient funds');
      });

      it('throws PaymentGatewayError on a network-level failure during initiation', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

        await expect(
          paystackSDK.initiateTransaction(validArgs.amount, validArgs.currency, validArgs.email, validArgs.reference),
        ).rejects.toThrow('Network Error');
      });

      it('surfaces the gateway response message and status code on an HTTP error during initiation', async () => {
        mockedAxios.post.mockRejectedValueOnce({
          response: { status: 401, data: { message: 'Invalid API key' } },
        });

        await expect(
          paystackSDK.initiateTransaction(validArgs.amount, validArgs.currency, validArgs.email, validArgs.reference),
        ).rejects.toMatchObject({ message: 'Invalid API key', code: '401' });
      });

      it('rejects invalid input before making any network call', async () => {
        await expect(
          paystackSDK.initiateTransaction(new Decimal(0), 'NG', 'not-an-email', ''),
        ).rejects.toThrow(PaymentGatewayError);
        expect(mockedAxios.post).not.toHaveBeenCalled();
      });

      it('throws TransactionVerificationError when the API reports verification failure', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: { status: false, message: 'Transaction not found' },
        });

        const result = paystackSDK.verifyTransaction('missing_ref');
        await expect(result).rejects.toThrow(TransactionVerificationError);
        await expect(result).rejects.toThrow('Transaction not found');
      });

      it('throws TransactionVerificationError on a network-level failure during verification', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('timeout of 5000ms exceeded'));

        const result = paystackSDK.verifyTransaction('ref_1');
        await expect(result).rejects.toThrow(TransactionVerificationError);
        await expect(result).rejects.toThrow('timeout of 5000ms exceeded');
      });
    });

    describe('Flutterwave', () => {
      it('throws PaymentGatewayError when the API reports initiation failure', async () => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { status: 'error', message: 'Invalid currency' },
        });

        await expect(
          flutterwaveSDK.initiateTransaction(validArgs.amount, validArgs.currency, validArgs.email, validArgs.reference),
        ).rejects.toThrow('Invalid currency');
      });

      it('throws PaymentGatewayError on a network-level failure during initiation', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

        await expect(
          flutterwaveSDK.initiateTransaction(validArgs.amount, validArgs.currency, validArgs.email, validArgs.reference),
        ).rejects.toThrow('Network Error');
      });

      it('surfaces the gateway response message and status code on an HTTP error during initiation', async () => {
        mockedAxios.post.mockRejectedValueOnce({
          response: { status: 400, data: { message: 'Invalid tx_ref' } },
        });

        await expect(
          flutterwaveSDK.initiateTransaction(validArgs.amount, validArgs.currency, validArgs.email, validArgs.reference),
        ).rejects.toMatchObject({ message: 'Invalid tx_ref', code: '400' });
      });

      it('rejects invalid input before making any network call', async () => {
        await expect(
          flutterwaveSDK.initiateTransaction(new Decimal(-1), 'N', 'not-an-email', ''),
        ).rejects.toThrow(PaymentGatewayError);
        expect(mockedAxios.post).not.toHaveBeenCalled();
      });

      it('throws TransactionVerificationError when the API reports verification failure', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: { status: 'error', message: 'Transaction not found' },
        });

        const result = flutterwaveSDK.verifyTransaction('missing_ref');
        await expect(result).rejects.toThrow(TransactionVerificationError);
        await expect(result).rejects.toThrow('Transaction not found');
      });

      it('throws TransactionVerificationError on a network-level failure during verification', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('timeout of 5000ms exceeded'));

        const result = flutterwaveSDK.verifyTransaction('ref_1');
        await expect(result).rejects.toThrow(TransactionVerificationError);
        await expect(result).rejects.toThrow('timeout of 5000ms exceeded');
      });
    });
  });

  describe('Parity between gateways', () => {
    let paystackSDK: AfricanPaymentGatewaySDK;
    let flutterwaveSDK: AfricanPaymentGatewaySDK;

    beforeEach(() => {
      paystackSDK = new AfricanPaymentGatewaySDK('paystack', { secretKey: paystackSecretKey });
      flutterwaveSDK = new AfricanPaymentGatewaySDK('flutterwave', {
        publicKey: flutterwavePublicKey,
        secretKey: flutterwaveSecretKey,
      });
    });

    it('returns the same InitiateTransactionResponse shape for both gateways', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Authorization URL created',
          data: { authorization_url: 'https://paystack.com/auth', access_code: 'xyz', reference: 'ref_a' },
        },
      });
      const paystackResult = await paystackSDK.initiateTransaction(new Decimal(100), 'NGN', 'a@example.com', 'ref_a');

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Hosted Link',
          data: { link: 'https://flutterwave.com/pay', tx_ref: 'ref_b' },
        },
      });
      const flutterwaveResult = await flutterwaveSDK.initiateTransaction(new Decimal(100), 'NGN', 'b@example.com', 'ref_b');

      const expectedKeys = ['message', 'reference', 'status', 'authorizationUrl'].sort();
      expect(Object.keys(paystackResult).sort()).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(flutterwaveResult).sort()).toEqual(expect.arrayContaining(expectedKeys));
      expect(paystackResult.status).toBe(flutterwaveResult.status);
    });

    it('returns the same VerifyTransactionResponse shape for both gateways', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'ok',
          data: {
            amount: 10000,
            currency: 'NGN',
            reference: 'ref_a',
            status: 'success',
            customer: { email: 'a@example.com', first_name: 'A', last_name: 'B' },
          },
        },
      });
      const paystackResult = await paystackSDK.verifyTransaction('ref_a');

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'ok',
          data: {
            amount: 100,
            currency: 'NGN',
            tx_ref: 'ref_b',
            status: 'successful',
            customer: { email: 'b@example.com', first_name: 'A', last_name: 'B' },
          },
        },
      });
      const flutterwaveResult = await flutterwaveSDK.verifyTransaction('ref_b');

      expect(Object.keys(paystackResult).sort()).toEqual(Object.keys(flutterwaveResult).sort());
      expect(Object.keys(paystackResult.data).sort()).toEqual(Object.keys(flutterwaveResult.data).sort());
      expect(paystackResult.data.amount).toBeInstanceOf(Decimal);
      expect(flutterwaveResult.data.amount).toBeInstanceOf(Decimal);
    });
  });

  describe('Decimal.js amount handling', () => {
    let paystackSDK: AfricanPaymentGatewaySDK;
    let flutterwaveSDK: AfricanPaymentGatewaySDK;

    beforeEach(() => {
      paystackSDK = new AfricanPaymentGatewaySDK('paystack', { secretKey: paystackSecretKey });
      flutterwaveSDK = new AfricanPaymentGatewaySDK('flutterwave', {
        publicKey: flutterwavePublicKey,
        secretKey: flutterwaveSecretKey,
      });
    });

    it('converts Naira to Kobo without floating-point drift for fractional amounts', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Authorization URL created',
          data: { authorization_url: 'https://paystack.com/auth', access_code: 'xyz', reference: 'ref_c' },
        },
      });

      // 19.99 * 100 in native floating point is 1998.9999999999998 - Decimal.js must avoid that.
      await paystackSDK.initiateTransaction(new Decimal('19.99'), 'NGN', 'c@example.com', 'ref_c');

      const [, body] = mockedAxios.post.mock.calls[0];
      expect((body as { amount: number }).amount).toBe(1999);
    });

    it('preserves sub-unit precision in Paystack when converting Kobo back to Naira', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'ok',
          data: {
            amount: 123456, // 1,234.56 Naira in Kobo
            currency: 'NGN',
            reference: 'ref_d',
            status: 'success',
            customer: { email: 'd@example.com' },
          },
        },
      });

      const result = await paystackSDK.verifyTransaction('ref_d');
      expect(result.data.amount.toString()).toBe('1234.56');
    });

    it('does not round large Flutterwave amounts when passing them through', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Hosted Link',
          data: { link: 'https://flutterwave.com/pay', tx_ref: 'ref_e' },
        },
      });

      await flutterwaveSDK.initiateTransaction(new Decimal('1000000.75'), 'NGN', 'e@example.com', 'ref_e');

      const [, body] = mockedAxios.post.mock.calls[0];
      expect((body as { amount: number }).amount).toBe(1000000.75);
    });

    it('keeps verified amounts as Decimal instances rather than lossy numbers', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'ok',
          data: { amount: 0.1, currency: 'NGN', tx_ref: 'ref_f', status: 'successful', customer: { email: 'f@example.com' } },
        },
      });

      const result = await flutterwaveSDK.verifyTransaction('ref_f');
      expect(result.data.amount).toBeInstanceOf(Decimal);
      expect(result.data.amount.plus(new Decimal('0.2')).toString()).toBe('0.3');
    });
  });
});
