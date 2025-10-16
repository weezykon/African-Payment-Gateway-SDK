import { PaymentGateway } from "../index";
import { Decimal } from "decimal.js";
import { InitiateTransactionResponse, VerifyTransactionResponse } from "../../types";
import { PaymentGatewayError, TransactionVerificationError } from "../../errors";

export class FlutterwaveGateway implements PaymentGateway {
  constructor(private publicKey: string, private secretKey: string) {}

  async initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<InitiateTransactionResponse> {
    try {
      // Simulate Flutterwave API call
      console.log(`Initiating Flutterwave transaction for ${amount.toString()} ${currency} for ${customerEmail} with reference ${reference}`);
      if (amount.lessThan(0)) {
        throw new PaymentGatewayError("Amount cannot be negative", "INVALID_AMOUNT");
      }
      return { message: "Flutterwave transaction initiated", reference, status: "success" };
    } catch (error: any) {
      throw new PaymentGatewayError(error.message, error.code);
    }
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    try {
      // Simulate Flutterwave API call to verify transaction
      console.log(`Verifying Flutterwave transaction with reference ${reference}`);
      if (reference === "invalid_ref") {
        throw new TransactionVerificationError("Invalid transaction reference", "INVALID_REFERENCE");
      }
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
    } catch (error: any) {
      throw new TransactionVerificationError(error.message, error.code);
    }
  }
}
