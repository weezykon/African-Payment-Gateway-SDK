import { PaymentGateway } from "../index";
import { Decimal } from "decimal.js";

export class FlutterwaveGateway implements PaymentGateway {
  constructor(private publicKey: string, private secretKey: string) {}

  async initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<any> {
    // Flutterwave API call to initiate transaction
    console.log(`Initiating Flutterwave transaction for ${amount.toString()} ${currency} for ${customerEmail} with reference ${reference}`);
    return Promise.resolve({ message: "Flutterwave transaction initiated" });
  }

  async verifyTransaction(reference: string): Promise<any> {
    // Flutterwave API call to verify transaction
    console.log(`Verifying Flutterwave transaction with reference ${reference}`);
    return Promise.resolve({ message: "Flutterwave transaction verified" });
  }
}
