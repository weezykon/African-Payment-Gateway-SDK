import * as crypto from "crypto";

export function verifyPaystackWebhookSignature(signature: string, payload: any, secret: string): boolean {
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');
  return hash === signature;
}

export function verifyFlutterwaveWebhookSignature(signature: string, payload: any, secret: string): boolean {
  // Flutterwave sends a `verif-hash` header. We need to compare it with our secret hash.
  // Note: The actual payload for Flutterwave might need to be handled differently based on their documentation.
  // For this example, we'll assume the `signature` parameter is the `verif-hash` header value.
  const expectedHash = crypto.createHash('md5').update(secret).digest('hex');
  return signature === expectedHash;
}
