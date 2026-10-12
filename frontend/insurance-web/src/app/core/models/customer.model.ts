export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'INACTIVE';
  dateOfBirth?: string;
  gender?: string;
  idType?: string;
  idNumber?: string;
  occupation?: string;
  annualIncome?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: string;
  gender?: string;
  idType?: string;
  idNumber?: string;
  occupation?: string;
  annualIncome?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
