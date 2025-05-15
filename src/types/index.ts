export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  customer: Customer;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  status: 'pending' | 'approved' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export type PurchaseOrderStatus = 'pending' | 'approved' | 'cancelled';