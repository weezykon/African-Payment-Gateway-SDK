import { PaymentGateway } from "../index";
import { Decimal } from "decimal.js";
import { InitiateTransactionResponse, VerifyTransactionResponse } from "../../types";

export class FlutterwaveGateway implements PaymentGateway {
  constructor(private publicKey: string, private secretKey: string) {}

  async initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<InitiateTransactionResponse> {
    // Flutterwave API call to initiate transaction
    console.log(`Initiating Flutterwave transaction for ${amount.toString()} ${currency} for ${customerEmail} with reference ${reference}`);
    return { message: "Flutterwave transaction initiated", reference, status: "success" };
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    // Flutterwave API call to verify transaction
    console.log(`Verifying Flutterwave transaction with reference ${reference}`);
    return {
      status: "success",
      message: "Flutterwave transaction verified",
      data: {
        amount: new Decimal(100),
        currency: "NGN",
        reference,
        status: "success",
        gatewayResponse: {},
        customer: { email: "test@example.com" },
      },
    };
  }
}
