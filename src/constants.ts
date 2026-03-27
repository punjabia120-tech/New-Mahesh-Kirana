import { Product, Vendor, Client, Transaction } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Basmati Rice (Premium)', sku: 'NMK001', category: 'Grains', price: 950, stock: 84, minQuantity: 20, gstSlab: 5, unit: 'KG' },
  { id: '2', name: 'Refined Sugar', sku: 'NMK042', category: 'Essentials', price: 45, stock: 5, minQuantity: 10, gstSlab: 12, unit: 'KG' },
  { id: '3', name: 'Full Cream Milk', sku: 'NMK089', category: 'Dairy', price: 32, stock: 0, minQuantity: 15, gstSlab: 0, unit: 'Packet' },
  { id: '4', name: 'Sunflower Oil', sku: 'NMK104', category: 'Oil', price: 145, stock: 22, minQuantity: 10, gstSlab: 5, unit: 'Litre' },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Adani Wilmar Ltd', mobile: '9876543210', email: 'accounts@adaniwilmar.com', gstNo: '24AAAAA0000A1Z5', balance: 15000, dueDate: '2026-03-30' },
  { id: 'v2', name: 'Amul Dairy', mobile: '9876543211', email: 'billing@amul.com', gstNo: '24BBBBB0000B1Z5', balance: 4500, dueDate: '2026-03-28' },
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Ramesh Kumar', mobile: '9988776655', email: 'ramesh.k@gmail.com', balance: 1200, dueDate: '2026-03-29' },
  { id: 'c2', name: 'Kajal Sharma', mobile: '9988776644', email: 'kajal.s@outlook.com', balance: 0 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'SALE', amount: 409, date: new Date().toISOString(), description: 'Sale to Ramesh', paymentMethod: 'UPI' },
  { id: 't2', type: 'SALE', amount: 295, date: new Date(Date.now() - 45 * 60000).toISOString(), description: 'Sale to Kajal', paymentMethod: 'CASH' },
];

export const GST_SLABS = [0, 5, 12, 18, 28];
