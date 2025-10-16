import { verifyPaystackWebhookSignature, verifyFlutterwaveWebhookSignature } from '../utils/webhook';
import { WebhookVerificationError } from '../errors';
import * as crypto from 'crypto';

describe('Webhook Signature Verification', () => {
  describe('Paystack Webhook Verification', () => {
    const secret = 'test_secret_key';
    const validPayload = {
      event: 'charge.success',
      data: {
        id: 123456,
        amount: 10000,
        currency: 'NGN',
        reference: 'test_ref_123',
      },
    };

    it('should verify valid Paystack webhook signature', () => {
      const validSignature = crypto.createHmac('sha512', secret).update(JSON.stringify(validPayload)).digest('hex');

      const result = verifyPaystackWebhookSignature(validSignature, validPayload, secret);
      expect(result).toBe(true);
    });

    it('should throw error for invalid Paystack webhook signature', () => {
      const invalidSignature = 'invalid_signature_hash';

      expect(() => {
        verifyPaystackWebhookSignature(invalidSignature, validPayload, secret);
      }).toThrow(WebhookVerificationError);

      expect(() => {
        verifyPaystackWebhookSignature(invalidSignature, validPayload, secret);
      }).toThrow('Paystack webhook signature mismatch');
    });

    it('should throw error when signature does not match payload', () => {
      const signature = crypto.createHmac('sha512', secret).update(JSON.stringify(validPayload)).digest('hex');

      const differentPayload = {
        event: 'charge.failed',
        data: {
          id: 789012,
          amount: 5000,
        },
      };

      expect(() => {
        verifyPaystackWebhookSignature(signature, differentPayload, secret);
      }).toThrow(WebhookVerificationError);
    });
  });

  describe('Flutterwave Webhook Verification', () => {
    const secret = 'test_flutterwave_hash';
    const validPayload = {
      event: 'charge.completed',
      data: {
        id: 123456,
        tx_ref: 'test_ref_456',
        amount: 200,
        currency: 'NGN',
      },
    };

    it('should verify valid Flutterwave webhook signature', () => {
      const validSignature = crypto.createHash('md5').update(secret).digest('hex');

      const result = verifyFlutterwaveWebhookSignature(validSignature, validPayload, secret);
      expect(result).toBe(true);
    });

    it('should throw error for invalid Flutterwave webhook signature', () => {
      const invalidSignature = 'invalid_md5_hash';

      expect(() => {
        verifyFlutterwaveWebhookSignature(invalidSignature, validPayload, secret);
      }).toThrow(WebhookVerificationError);

      expect(() => {
        verifyFlutterwaveWebhookSignature(invalidSignature, validPayload, secret);
      }).toThrow('Flutterwave webhook signature mismatch');
    });

    it('should throw error when using wrong secret', () => {
      const correctSignature = crypto.createHash('md5').update(secret).digest('hex');
      const wrongSecret = 'wrong_secret';
      const wrongSignature = crypto.createHash('md5').update(wrongSecret).digest('hex');

      expect(() => {
        verifyFlutterwaveWebhookSignature(wrongSignature, validPayload, secret);
      }).toThrow(WebhookVerificationError);

      expect(() => {
        verifyFlutterwaveWebhookSignature(correctSignature, validPayload, wrongSecret);
      }).toThrow(WebhookVerificationError);
    });
  });
});
