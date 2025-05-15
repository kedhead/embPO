import React, { createContext, useContext, useState, useEffect } from 'react';
import { PurchaseOrder, LineItem } from '../types';

const API_URL = 'http://127.0.0.1:5000/api';

interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => Promise<PurchaseOrder>;
  getPurchaseOrder: (id: string) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  calculateTotal: (lineItems: LineItem[], taxRate: number) => {
    subtotal: number;
    taxAmount: number;
    total: number;
  };
}

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

export const usePurchaseOrder = () => {
  const context = useContext(PurchaseOrderContext);
  if (!context) {
    throw new Error('usePurchaseOrder must be used within a PurchaseOrderProvider');
  }
  return context;
};

export const PurchaseOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch orders from backend when component mounts
    setLoading(true);
    fetch(`${API_URL}/purchase-orders`)
      .then(response => response.json())
      .then(data => setPurchaseOrders(data))
      .catch(error => console.error('Error fetching purchase orders:', error))
      .finally(() => setLoading(false));
  }, []);

  const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => {
    try {
      console.log('Sending request to:', `${API_URL}/purchase-orders`);
      console.log('Request data:', order);
      
      const response = await fetch(`${API_URL}/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPurchaseOrders(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create purchase order: ${error.message}`);
      }
      throw new Error('Failed to create purchase order: Network error');
    }
  };

  const getPurchaseOrder = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase order');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      throw error;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update purchase order');
      }

      const updatedOrder = await response.json();
      setPurchaseOrders(prev =>
        prev.map(order => (order.id === id ? updatedOrder : order))
      );
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/purchase-orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase order');
      }

      setPurchaseOrders(prev => prev.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  };

  const calculateTotal = (lineItems: LineItem[], taxRate: number) => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  return (
    <PurchaseOrderContext.Provider
      value={{
        purchaseOrders,
        addPurchaseOrder,
        getPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        calculateTotal,
      }}
    >
      {children}
    </PurchaseOrderContext.Provider>
  );
};