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

  describe('Edge cases', () => {
    const paystackSecret = 'test_secret_key';
    const flutterwaveSecret = 'test_flutterwave_hash';

    it('rejects a bad Paystack signature regardless of payload shape', () => {
      expect(() => {
        verifyPaystackWebhookSignature('not-a-real-hash', { event: 'charge.success' }, paystackSecret);
      }).toThrow(WebhookVerificationError);
    });

    it('rejects a bad Flutterwave signature regardless of payload shape', () => {
      expect(() => {
        verifyFlutterwaveWebhookSignature('not-a-real-hash', { event: 'charge.completed' }, flutterwaveSecret);
      }).toThrow(WebhookVerificationError);
    });

    it('verifies a replayed Paystack payload identically on every call (no built-in replay protection)', () => {
      const payload = { event: 'charge.success', data: { id: 1, reference: 'ref_replay' } };
      const signature = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(payload)).digest('hex');

      // Signature verification is stateless: resending the same valid payload/signature pair
      // must keep succeeding. Protecting against replay (e.g. de-duping by reference) is the
      // caller's responsibility, not this function's.
      expect(verifyPaystackWebhookSignature(signature, payload, paystackSecret)).toBe(true);
      expect(verifyPaystackWebhookSignature(signature, payload, paystackSecret)).toBe(true);
    });

    it('verifies a replayed Flutterwave payload identically on every call (no built-in replay protection)', () => {
      const payload = { event: 'charge.completed', data: { id: 1, tx_ref: 'ref_replay' } };
      const signature = crypto.createHash('md5').update(flutterwaveSecret).digest('hex');

      expect(verifyFlutterwaveWebhookSignature(signature, payload, flutterwaveSecret)).toBe(true);
      expect(verifyFlutterwaveWebhookSignature(signature, payload, flutterwaveSecret)).toBe(true);
    });

    it('wraps a malformed (non-serializable) Paystack payload in a WebhookVerificationError', () => {
      const circular: Record<string, unknown> = { event: 'charge.success' };
      circular.self = circular; // JSON.stringify cannot serialize this

      expect(() => {
        verifyPaystackWebhookSignature('any-signature', circular, paystackSecret);
      }).toThrow(WebhookVerificationError);
      expect(() => {
        verifyPaystackWebhookSignature('any-signature', circular, paystackSecret);
      }).toThrow('Paystack webhook verification failed');
    });

    it('rejects an empty or missing Paystack signature', () => {
      const payload = { event: 'charge.success', data: {} };

      expect(() => {
        verifyPaystackWebhookSignature('', payload, paystackSecret);
      }).toThrow(WebhookVerificationError);
    });

    it('rejects an empty or missing Flutterwave signature', () => {
      const payload = { event: 'charge.completed', data: {} };

      expect(() => {
        verifyFlutterwaveWebhookSignature('', payload, flutterwaveSecret);
      }).toThrow(WebhookVerificationError);
    });

    it('treats an empty object payload as a valid (if unusual) Paystack body', () => {
      const payload = {};
      const signature = crypto.createHmac('sha512', paystackSecret).update(JSON.stringify(payload)).digest('hex');

      expect(verifyPaystackWebhookSignature(signature, payload, paystackSecret)).toBe(true);
    });
  });
});
