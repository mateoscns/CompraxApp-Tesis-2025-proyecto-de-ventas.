export interface User {
  id: number;
  name: string;
  email: string;
  shippingAddress?: string;
  roles: string[];
  active: boolean;
  enabled: boolean;
  createdAt?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  shippingAddress?: string;
  roles: string[];
  purchaseHistory?: any[];
}

export interface UserUpdateRequest {
  name: string;
  email: string;
  shippingAddress?: string;
}