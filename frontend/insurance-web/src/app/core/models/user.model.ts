export type UserRole = 
  | 'ADMIN' 
  | 'UNDERWRITER' 
  | 'CLAIMS_OFFICER' 
  | 'FINANCE_OFFICER' 
  | 'CUSTOMER_SERVICE' 
  | 'CUSTOMER'
  | 'READ_ONLY';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: UserRole[];
  customerId?: string;
  status?: string;
}

export interface CustomerRegisterRequest {
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
  username: string;
  password: string;
}

export interface AdminCreateUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

export interface AdminUpdateUserRequest {
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  newPassword?: string;
  unlockAccount?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  customerId?: string;
  status: string;
  createdAt: string;
}

export interface ActorInfo {
  role: UserRole;
  title: string;
  responsibility: string;
  defaultRedirect: string;
  demoUsername: string;
  demoPassword: string;
}
