import { PaymentGateway } from "../index";
import { Decimal } from "decimal.js";
import { InitiateTransactionResponse, VerifyTransactionResponse } from "../../types";

export class PaystackGateway implements PaymentGateway {
  constructor(private secretKey: string) {}

  async initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<InitiateTransactionResponse> {
    // Paystack API call to initiate transaction
    console.log(`Initiating Paystack transaction for ${amount.toString()} ${currency} for ${customerEmail} with reference ${reference}`);
    return { message: "Paystack transaction initiated", reference, status: "success" };
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    // Paystack API call to verify transaction
    console.log(`Verifying Paystack transaction with reference ${reference}`);
    return {
      status: "success",
      message: "Paystack transaction verified",
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
