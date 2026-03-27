export type Role = 'ADMIN' | 'GENERAL';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minQuantity: number;
  gstSlab: number;
  unit: string;
  image?: string;
}

export interface Vendor {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  gstNo?: string;
  gstSlab?: number;
  balance: number;
  dueDate?: string;
}

export interface Client {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  balance: number;
  dueDate?: string;
}

export interface Transaction {
  id: string;
  type: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'INCOME';
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'PAYMENT_DUE' | 'RECEIVABLE_DUE';
  message: string;
  date: string;
  read: boolean;
  amount?: number;
  clientId?: string;
}
