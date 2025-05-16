import React, { createContext, useContext, useState, useEffect } from 'react';
import { PurchaseOrder, LineItem } from '../types';
import { API_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';

const API_URL = API_BASE_URL;

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
    axios.get(`${API_URL}/purchase-orders`)
      .then(response => setPurchaseOrders(response.data))
      .catch(error => console.error('Error fetching purchase orders:', error))
      .finally(() => setLoading(false));
  }, []);

  const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>): Promise<PurchaseOrder> => {
    try {
      const formattedLineItems = order.lineItems.map(item => ({
        id: item.id || `temp-${Date.now()}-${Math.random()}`,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }));
      
      console.log('Sending API request to:', `${API_URL}/purchase-orders`);
      console.log('Request payload:', {
        ...order,
        lineItems: formattedLineItems,
        subtotal: Number(order.subtotal),
        taxRate: Number(order.taxRate),
        taxAmount: Number(order.taxAmount),
        total: Number(order.total)
      });
      
      const response = await axios.post(`${API_URL}/purchase-orders`, {
        ...order,
        lineItems: formattedLineItems,
        subtotal: Number(order.subtotal),
        taxRate: Number(order.taxRate),
        taxAmount: Number(order.taxAmount),
        total: Number(order.total)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      setPurchaseOrders(prev => [...prev, response.data]);
      return response.data;
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
      const response = await axios.get(`${API_URL}/purchase-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      throw error;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      console.log('Updating purchase order:', id);
      console.log('Update data:', updates);
      
      // Create the request data object
      const requestData: any = {...updates};
      
      // Handle line items if present
      if (updates.lineItems) {
        requestData.lineItems = updates.lineItems.map((item: LineItem) => ({
          id: item.id || `temp-${Date.now()}-${Math.random()}`,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }));
      }
      
      // Ensure numeric fields are properly formatted
      if (updates.subtotal !== undefined) requestData.subtotal = Number(updates.subtotal);
      if (updates.taxRate !== undefined) requestData.taxRate = Number(updates.taxRate);
      if (updates.taxAmount !== undefined) requestData.taxAmount = Number(updates.taxAmount);
      if (updates.total !== undefined) requestData.total = Number(updates.total);
      
      // Log the final request data
      console.log('Sending request data:', requestData);
      
      const response = await axios.put(`${API_URL}/purchase-orders/${id}`, requestData);

      const updatedOrder = response.data;
      setPurchaseOrders(prev =>
        prev.map(order => (order.id === id ? updatedOrder : order))
      );
      return updatedOrder;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update purchase order: ${error.message}`);
      }
      throw new Error('Failed to update purchase order: Network error');
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/purchase-orders/${id}`);

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