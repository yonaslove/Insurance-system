export interface Payment {
  id: string;
  paymentReference: string;
  policyId: string;
  claimId?: string;
  amount: number;
  currency: string;
  paymentMethodReference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paidAt: string;
  createdAt: string;
}

export interface PaymentCreateRequest {
  policyId: string;
  claimId?: string;
  amount: number;
  currency: string;
  paymentMethodReference: string;
  idempotencyKey?: string;
}
