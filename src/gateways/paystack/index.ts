import { PaymentGateway } from "../index";

export class PaystackGateway implements PaymentGateway {
  constructor(private secretKey: string) {}

  async initiateTransaction(amount: number, currency: string, customerEmail: string, reference: string): Promise<any> {
    // Paystack API call to initiate transaction
    console.log(`Initiating Paystack transaction for ${amount} ${currency} for ${customerEmail} with reference ${reference}`);
    return Promise.resolve({ message: "Paystack transaction initiated" });
  }

  async verifyTransaction(reference: string): Promise<any> {
    // Paystack API call to verify transaction
    console.log(`Verifying Paystack transaction with reference ${reference}`);
    return Promise.resolve({ message: "Paystack transaction verified" });
  }
}
