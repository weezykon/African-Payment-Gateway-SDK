import { PaymentGateway } from "./gateways";
import { PaystackGateway } from "./gateways/paystack";
import { FlutterwaveGateway } from "./gateways/flutterwave";
import { Decimal } from "decimal.js";

export class AfricanPaymentGatewaySDK {
  private gateway: PaymentGateway;

  constructor(gatewayType: 'paystack' | 'flutterwave', credentials: any) {
    if (gatewayType === 'paystack') {
      this.gateway = new PaystackGateway(credentials.secretKey);
    } else if (gatewayType === 'flutterwave') {
      this.gateway = new FlutterwaveGateway(credentials.publicKey, credentials.secretKey);
    } else {
      throw new Error('Invalid gateway type provided.');
    }
  }

  public initiateTransaction(amount: Decimal, currency: string, customerEmail: string, reference: string): Promise<any> {
    return this.gateway.initiateTransaction(amount, currency, customerEmail, reference);
  }

  public verifyTransaction(reference: string): Promise<any> {
    return this.gateway.verifyTransaction(reference);
  }
}
