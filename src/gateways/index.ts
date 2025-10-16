export interface PaymentGateway {
  initiateTransaction(amount: number, currency: string, customerEmail: string, reference: string): Promise<any>;
  verifyTransaction(reference: string): Promise<any>;
}
