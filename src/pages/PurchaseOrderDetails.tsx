import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePurchaseOrder } from '../contexts/PurchaseOrderContext';
import { PurchaseOrder, LineItem } from '../types';

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
    const taxRate = order?.taxRate || 0.1; // Default to 10% if not set
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxRate, taxAmount, total };
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Order: {order.orderNumber}</h1>
        <div className="space-x-4">
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-md ${
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              Save
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-gray-900">{order.customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900">{order.customer.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
          {isEditing && (
            <button
              onClick={addLineItem}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Add Line Item
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                {isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isEditing ? editedLineItems : order.lineItems).map((item: LineItem, index: number) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-gray-900">{item.description}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        min="0"
                        className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-gray-900">{item.quantity}</span>
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
                    ) : (
                      <span className="text-gray-900">${item.unitPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
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
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-4">
          {isEditing ? (
            (() => {
              const { subtotal, taxAmount, total } = calculateTotals(editedLineItems);
              return (
                <>
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax Rate:</span>
                    <span className="font-medium">{(order.taxRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax Amount:</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-semibold text-lg border-t pt-4">
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
                <span className="font-medium">{(order.taxRate * 100).toFixed(0)}%</span>
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