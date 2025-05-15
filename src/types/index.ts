export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type PurchaseOrderStatus = 'pending' | 'completed' | 'cancelled';

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
  createdAt: string;
  status: PurchaseOrderStatus;
}