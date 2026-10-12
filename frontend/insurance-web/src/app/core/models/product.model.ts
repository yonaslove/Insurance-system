export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'HEALTH' | 'AUTO' | 'HOME' | 'LIFE';
  basePremium: number;
  active: boolean;
  createdAt: string;
}

export interface ProductCreateRequest {
  code: string;
  name: string;
  description: string;
  category: 'HEALTH' | 'AUTO' | 'HOME' | 'LIFE';
  basePremium: number;
  active: boolean;
}
