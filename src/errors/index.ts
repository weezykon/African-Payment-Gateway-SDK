export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}

export class TransactionVerificationError extends PaymentGatewayError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'TransactionVerificationError';
  }
}

export class WebhookVerificationError extends PaymentGatewayError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'WebhookVerificationError';
  }
}
