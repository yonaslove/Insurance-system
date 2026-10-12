export interface ActivityItem {
  id: string;
  type: 'POLICY' | 'CLAIM' | 'PAYMENT' | 'CUSTOMER';
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  activePolicies: number;
  openClaims: number;
  totalPaymentsAmount: number;
  currency: string;
  recentActivities: ActivityItem[];
}
