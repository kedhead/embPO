import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePurchaseOrder } from '../contexts/PurchaseOrderContext';
import { PurchaseOrder, LineItem } from '../types';
import { setupPrintSettings } from '../utils/printSettings';
import { CompanyHeader } from '../components/CompanyHeader';

export const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPurchaseOrder, updatePurchaseOrder } = usePurchaseOrder();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLineItems, setEditedLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!id) return;
        const orderData = await getPurchaseOrder(id);
        setOrder(orderData);
        setEditedLineItems(orderData.lineItems);
      } catch (err) {
        setError('Failed to load purchase order');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, getPurchaseOrder]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedLineItems([...order?.lineItems || []]);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: '',
      quantity: 0,
      unitPrice: 0
    };
    setEditedLineItems([...editedLineItems, newItem]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...editedLineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'description' ? value : Number(value)
    };
    setEditedLineItems(updatedItems);
  };

  const removeLineItem = (index: number) => {
    setEditedLineItems(editedLineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = (order?.taxRate || 0.1) / 100; // Convert percentage to decimal
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxRate: taxRate * 100, taxAmount, total };
  };  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = setupPrintSettings();
    
    // Temporarily store the original title
    const originalTitle = document.title;
    // Clear the title to prevent it from appearing in print
    document.title = '';
    
    document.head.appendChild(style);
    window.print();
    
    // Restore the original title
    document.title = originalTitle;
    document.head.removeChild(style);
  };

  const handleSave = async () => {
    if (!order || !id) return;
    
    try {
      const { subtotal, taxRate, taxAmount, total } = calculateTotals(editedLineItems);
      
      await updatePurchaseOrder(id, {
        ...order,
        lineItems: editedLineItems,
        subtotal,
        taxRate,
        taxAmount,
        total
      });
      
      setIsEditing(false);
      // Refresh order data
      const updatedOrder = await getPurchaseOrder(id);
      setOrder(updatedOrder);
      setEditedLineItems(updatedOrder.lineItems);
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div>Order not found</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:bg-white">
      <CompanyHeader />
        <div className="flex justify-between items-center mb-8 print:mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 print:text-lg">Purchase Order: {order.orderNumber}</h1>
        <div className="space-x-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md print:hidden"
          >
            Print
          </button>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-md print:hidden ${
              isEditing
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md print:hidden"
            >
              Save
            </button>
          )}
        </div>
      </div>      <div className="bg-white shadow-sm rounded-lg p-6 mb-8 print:shadow-none print:p-0 print:mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-base print:mb-2">Customer Information</h2>        <div className="grid grid-cols-2 gap-4 print:gap-2">
          {order.customer.name && (
            <div>
              <p className="text-sm text-gray-500 print:text-xs print:text-gray-700">Name</p>
              <p className="text-gray-900 font-medium print:text-sm">{order.customer.name}</p>
            </div>
          )}          {order.customer.email?.trim() && (
            <div>
              <p className="text-sm text-gray-500 print:text-xs print:text-gray-700">Email</p>
              <p className="text-gray-900 font-medium print:text-sm">{order.customer.email}</p>
            </div>
          )}
          {order.customer.phone && (
            <div>
              <p className="text-sm text-gray-500 print:text-xs print:text-gray-700">Phone</p>
              <p className="text-gray-900 font-medium print:text-sm">{order.customer.phone}</p>
            </div>
          )}
          {order.customer.address && (
            <div>
              <p className="text-sm text-gray-500 print:text-xs print:text-gray-700">Address</p>
              <p className="text-gray-900 font-medium print:text-sm">{order.customer.address}</p>
            </div>
          )}
        </div>
      </div>      <div className="bg-white shadow-sm rounded-lg p-6 mb-8 print:shadow-none print:p-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 print:text-base">Line Items</h2>
          {isEditing && (
            <button
              onClick={addLineItem}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md print:hidden"
            >
              Add Line Item
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto print:overflow-visible">
          <table className="min-w-full divide-y divide-gray-200 print:border print:border-gray-200">
            <thead className="bg-gray-50">              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">Total</th>
                {isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isEditing ? editedLineItems : order.lineItems).map((item: LineItem, index: number) => (
                <tr key={item.id}>                  <td className="px-6 py-4 whitespace-nowrap print:px-4 print:py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (                      <span className="text-gray-900 print:text-sm">{item.description}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap print:px-4 print:py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        min="0"
                        className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-gray-900 print:text-sm">{item.quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (                      <span className="text-gray-900 print:text-sm">${item.unitPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 print:px-4 print:py-2">
                    <span className="print:text-sm">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>      <div className="bg-white shadow-sm rounded-lg p-6 print:shadow-none print:p-0 print:mt-4 print:no-break">
        <div className="space-y-4 max-w-md ml-auto print:space-y-2">
          {isEditing ? (
            (() => {
              const { subtotal, taxAmount, total } = calculateTotals(editedLineItems);
              return (
                <>
                  <div className="flex justify-between text-gray-700 print:text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>                  <div className="flex justify-between text-gray-700 print:text-sm">
                    <span>Tax Rate:</span>
                    <span className="font-medium">{(order.taxRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-gray-700 print:text-sm">
                    <span>Tax Amount:</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-semibold text-lg border-t pt-4 print:text-base print:pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </>
              );
            })()
          ) : (
            <>
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax Rate:</span>
                <span className="font-medium">{order.taxRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax Amount:</span>
                <span className="font-medium">${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-semibold text-lg border-t pt-4">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;