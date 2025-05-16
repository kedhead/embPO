import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrder } from '../contexts/PurchaseOrderContext';
import { PurchaseOrder, LineItem, PurchaseOrderStatus } from '../types';
import { setupPrintSettings } from '../utils/printSettings';
import { CompanyHeader } from '../components/CompanyHeader';
import { Trash, Mail } from 'lucide-react';

export const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrder();  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLineItems, setEditedLineItems] = useState<LineItem[]>([]);
  const [editedStatus, setEditedStatus] = useState<PurchaseOrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);  const [emailStatus, setEmailStatus] = useState<{loading: boolean, success?: boolean, message?: string}>({loading: false});

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!id) return;        const orderData = await getPurchaseOrder(id);
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
      setEditedStatus(order?.status as PurchaseOrderStatus || 'pending');
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
        status: editedStatus || order.status,
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

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    if (!order || !id) return;
    
    try {
      await deletePurchaseOrder(id);
      navigate('/purchase-orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const handleEmail = async () => {
    if (!order || !id) return;
    
    try {
      setEmailStatus({loading: true});
      
      // Check if customer email exists
      if (!order.customer.email) {
        setEmailStatus({
          loading: false,
          success: false,
          message: 'Customer email is missing. Please add an email address first.'
        });
        return;
      }
        // Send the purchase order as email
      console.log(`Sending email to ${order.customer.email} for order ${id}`);
      const response = await fetch(`/api/purchase-orders/${id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: order.customer.email,
          subject: `Purchase Order ${order.orderNumber} from StitchPay`,
        })
      });
      
      console.log('Email API response status:', response.status);
      const result = await response.json();
      console.log('Email API response:', result);
        if (response.ok) {
        setEmailStatus({
          loading: false,
          success: true,
          message: `Email with PDF attachment sent successfully to ${order.customer.email}`
        });
      } else {
        setEmailStatus({
          loading: false,
          success: false,
          message: result.message || 'Failed to send email'
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus({
        loading: false,
        success: false,
        message: 'An error occurred while sending the email'
      });
    }
    
    // Clear status message after 5 seconds
    setTimeout(() => {
      setEmailStatus({loading: false});
    }, 5000);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div>Order not found</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:bg-white">
      <CompanyHeader />
        <div className="flex justify-between items-start mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 print:text-lg">Purchase Order: {order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1 print:text-xs">Created: {new Date(order.createdAt).toLocaleDateString()}</p>
          {!isEditing && (
            <div className="mt-2">
              <span className={`px-3 py-1 text-sm rounded-full inline-block ${
                order.status === 'unpaid' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : order.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <div className="mb-2">
            <span className="text-sm text-gray-500 mr-2 print:text-xs">Status:</span>
            {isEditing ? (
              <select 
                value={editedStatus || order.status}
                onChange={(e) => setEditedStatus(e.target.value as PurchaseOrderStatus)}
                className="border rounded-md px-2 py-1 text-sm"
              >                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            ) : (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            )}
          </div>
            <div className="space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
            >
              Print
            </button>
            <button
              onClick={handleEmail}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              disabled={emailStatus.loading}
            >
              {emailStatus.loading ? 'Sending...' : 
              <>
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </>}
            </button>
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
            {!isEditing && (
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md ml-2"
              >
                <Trash className="h-4 w-4 inline mr-1" />
                Delete
              </button>
            )}
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
      </div>      {emailStatus.message && (
        <div className={`mb-4 p-4 rounded-md ${emailStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {emailStatus.message}
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8 print:shadow-none print:p-0 print:mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 print:text-base print:mb-2">Customer Information</h2><div className="grid grid-cols-2 gap-4 print:gap-2">
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete purchase order <span className="font-medium">#{order.orderNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetails;