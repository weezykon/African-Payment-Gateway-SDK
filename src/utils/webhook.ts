import * as crypto from 'crypto';
import { WebhookVerificationError } from '../errors';

export function verifyPaystackWebhookSignature(signature: string, payload: any, secret: string): boolean {
  try {
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');
    if (hash !== signature) {
      throw new WebhookVerificationError('Paystack webhook signature mismatch');
    }
    return true;
  } catch (error: any) {
    throw new WebhookVerificationError(`Paystack webhook verification failed: ${error.message}`);
  }
}

export function verifyFlutterwaveWebhookSignature(signature: string, payload: any, secret: string): boolean {
  try {
    const expectedHash = crypto.createHash('md5').update(secret).digest('hex');
    if (signature !== expectedHash) {
      throw new WebhookVerificationError('Flutterwave webhook signature mismatch');
    }
    return true;
  } catch (error: any) {
    throw new WebhookVerificationError(`Flutterwave webhook verification failed: ${error.message}`);
  }
}
