import * as crypto from "crypto";

export function verifyPaystackWebhookSignature(signature: string, payload: any, secret: string): boolean {
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');
  return hash === signature;
}

export function verifyFlutterwaveWebhookSignature(signature: string, payload: any, secret: string): boolean {
  // Placeholder for Flutterwave webhook signature verification logic
  console.log("Verifying Flutterwave webhook signature...");
  return true; // For now, always return true
}
