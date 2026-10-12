export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  customerName?: string;
  productId: string;
  productName?: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  currency: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
}

export interface PolicyCreateRequest {
  customerId: string;
  productId: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  currency: string;
}
