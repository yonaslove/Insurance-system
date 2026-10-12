export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber?: string;
  incidentDate: string;
  description: string;
  claimedAmount: number;
  approvedAmount?: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewerNotes?: string;
  createdAt: string;
}

export interface ClaimCreateRequest {
  policyId: string;
  incidentDate: string;
  description: string;
  claimedAmount: number;
}

export interface ClaimDecisionRequest {
  status: 'APPROVED' | 'REJECTED';
  approvedAmount?: number;
  reviewerNotes: string;
}
