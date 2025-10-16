import { PaymentGateway } from "../index";
import { Decimal } from "decimal.js";
import { InitiateTransactionResponse, VerifyTransactionResponse } from "../../types";
import { PaymentGatewayError, TransactionVerificationError } from "../../errors";

export class PaystackGateway implements PaymentGateway {
  constructor(private secretKey: string) {}

  async initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<InitiateTransactionResponse> {
    try {
      // Simulate Paystack API call
      console.log(`Initiating Paystack transaction for ${amount.toString()} ${currency} for ${customerEmail} with reference ${reference}`);
      if (amount.lessThan(0)) {
        throw new PaymentGatewayError("Amount cannot be negative", "INVALID_AMOUNT");
      }
      return { message: "Paystack transaction initiated", reference, status: "success" };
    } catch (error: any) {
      throw new PaymentGatewayError(error.message, error.code);
    }
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    try {
      // Simulate Paystack API call to verify transaction
      console.log(`Verifying Paystack transaction with reference ${reference}`);
      if (reference === "invalid_ref") {
        throw new TransactionVerificationError("Invalid transaction reference", "INVALID_REFERENCE");
      }
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
    } catch (error: any) {
      throw new TransactionVerificationError(error.message, error.code);
    }
  }
}
