import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PurchaseOrder, LineItem, PurchaseOrderStatus } from '../types';
import { Printer, Mail, ArrowLeft, Edit, Save, X, Trash, Plus, Minus } from 'lucide-react';
import { usePurchaseOrder } from '../contexts/PurchaseOrderContext';
import { useSettings } from '../contexts/SettingsContext';
import NotFound from './NotFound';

const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrder();
  const { settings } = useSettings();
  
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [editedOrder, setEditedOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getPurchaseOrder(id);
        setOrder(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, getPurchaseOrder]);

  const startEditing = () => {
    if (order) {
      setEditedOrder({ ...order });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setEditedOrder(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedOrder || !id) return;

    try {
      setSaving(true);
      await updatePurchaseOrder(id, editedOrder);
      const updatedOrder = await getPurchaseOrder(id);
      setOrder(updatedOrder);
      setIsEditing(false);
      setEditedOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    
    try {
      await deletePurchaseOrder(order.id);
      navigate('/purchase-orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };
  
  const printPurchaseOrder = () => {
    window.print();
  };
  
  const sendPurchaseOrderEmail = () => {
    if (!order) return;
    window.alert(`Purchase order would be emailed to ${order.customer.email}`);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return <NotFound />;
  }

  const displayOrder = editedOrder || order;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="mr-1 h-5 w-5" />
          Back
        </button>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={printPurchaseOrder}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </button>
              <button
                onClick={sendPurchaseOrderEmail}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </button>              <button
                onClick={startEditing}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order #{displayOrder.orderNumber}</h1>
            <p className="text-gray-600">Created on {new Date(displayOrder.createdAt).toLocaleDateString()}</p>
          </div>

          <div>
            {isEditing ? (
              <select
                value={displayOrder.status}
                onChange={(e) => {
                  if (editedOrder) {
                    setEditedOrder({
                      ...editedOrder,
                      status: e.target.value as PurchaseOrderStatus
                    });
                  }
                }}
                className="border rounded p-2"
              >                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            ) : (              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                displayOrder.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                displayOrder.status === 'paid' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {displayOrder.status.charAt(0).toUpperCase() + displayOrder.status.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">From</h2>
            <div className="text-gray-700">
              <p>{settings.companyName}</p>
              <p>{settings.companyAddress}</p>
              <p>{settings.companyPhone}</p>
              <p>{settings.companyEmail}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">To</h2>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={displayOrder.customer.name}
                  onChange={(e) => {
                    if (editedOrder) {
                      setEditedOrder({
                        ...editedOrder,
                        customer: {
                          ...editedOrder.customer,
                          name: e.target.value
                        }
                      });
                    }
                  }}
                  className="border rounded p-2 w-full"
                  placeholder="Customer Name"
                />
                <input
                  type="text"
                  value={displayOrder.customer.email}
                  onChange={(e) => {
                    if (editedOrder) {
                      setEditedOrder({
                        ...editedOrder,
                        customer: {
                          ...editedOrder.customer,
                          email: e.target.value
                        }
                      });
                    }
                  }}
                  className="border rounded p-2 w-full"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={displayOrder.customer.phone || ''}
                  onChange={(e) => {
                    if (editedOrder) {
                      setEditedOrder({
                        ...editedOrder,
                        customer: {
                          ...editedOrder.customer,
                          phone: e.target.value
                        }
                      });
                    }
                  }}
                  className="border rounded p-2 w-full"
                  placeholder="Phone"
                />
                <textarea
                  value={displayOrder.customer.address || ''}
                  onChange={(e) => {
                    if (editedOrder) {
                      setEditedOrder({
                        ...editedOrder,
                        customer: {
                          ...editedOrder.customer,
                          address: e.target.value
                        }
                      });
                    }
                  }}
                  className="border rounded p-2 w-full"
                  placeholder="Address"
                  rows={3}
                />
              </div>
            ) : (
              <div className="text-gray-700">
                <p>{displayOrder.customer.name}</p>
                <p>{displayOrder.customer.email}</p>
                {displayOrder.customer.phone && <p>{displayOrder.customer.phone}</p>}
                {displayOrder.customer.address && <p>{displayOrder.customer.address}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Line Items</h2>
            {isEditing && (
              <button
                onClick={() => {
                  if (editedOrder) {
                    const newItem: LineItem = {
                      id: `temp-${Date.now()}`,
                      description: '',
                      quantity: 1,
                      unitPrice: 0
                    };
                    setEditedOrder({
                      ...editedOrder,
                      lineItems: [...editedOrder.lineItems, newItem]
                    });
                  }
                }}
                className="flex items-center text-blue-500 hover:text-blue-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Unit Price</th>
                  <th className="text-right p-2">Total</th>
                  {isEditing && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {displayOrder.lineItems.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            if (editedOrder) {
                              const newLineItems = [...editedOrder.lineItems];
                              newLineItems[index] = {
                                ...item,
                                description: e.target.value
                              };
                              setEditedOrder({
                                ...editedOrder,
                                lineItems: newLineItems
                              });
                            }
                          }}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        item.description
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            if (editedOrder) {
                              const newLineItems = [...editedOrder.lineItems];
                              newLineItems[index] = {
                                ...item,
                                quantity: Number(e.target.value)
                              };
                              const subtotal = newLineItems.reduce(
                                (sum, item) => sum + item.quantity * item.unitPrice,
                                0
                              );
                              const taxAmount = subtotal * (editedOrder.taxRate / 100);
                              setEditedOrder({
                                ...editedOrder,
                                lineItems: newLineItems,
                                subtotal,
                                taxAmount,
                                total: subtotal + taxAmount
                              });
                            }
                          }}
                          className="border rounded p-1 w-20 text-right"
                        />
                      ) : (
                        <span className="text-right block">{item.quantity}</span>
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => {
                            if (editedOrder) {
                              const newLineItems = [...editedOrder.lineItems];
                              newLineItems[index] = {
                                ...item,
                                unitPrice: Number(e.target.value)
                              };
                              const subtotal = newLineItems.reduce(
                                (sum, item) => sum + item.quantity * item.unitPrice,
                                0
                              );
                              const taxAmount = subtotal * (editedOrder.taxRate / 100);
                              setEditedOrder({
                                ...editedOrder,
                                lineItems: newLineItems,
                                subtotal,
                                taxAmount,
                                total: subtotal + taxAmount
                              });
                            }
                          }}
                          className="border rounded p-1 w-24 text-right"
                        />
                      ) : (
                        <span className="text-right block">${item.unitPrice.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-2 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    {isEditing && (
                      <td className="p-2">
                        <button
                          onClick={() => {
                            if (editedOrder) {
                              const newLineItems = editedOrder.lineItems.filter((_, i) => i !== index);
                              const subtotal = newLineItems.reduce(
                                (sum, item) => sum + item.quantity * item.unitPrice,
                                0
                              );
                              const taxAmount = subtotal * (editedOrder.taxRate / 100);
                              setEditedOrder({
                                ...editedOrder,
                                lineItems: newLineItems,
                                subtotal,
                                taxAmount,
                                total: subtotal + taxAmount
                              });
                            }
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={isEditing ? 3 : 2} className="p-2 text-right font-medium">Subtotal:</td>
                  <td className="p-2 text-right">${displayOrder.subtotal.toFixed(2)}</td>
                  {isEditing && <td></td>}
                </tr>
                <tr>
                  <td colSpan={isEditing ? 2 : 1} className="p-2 text-right font-medium">Tax Rate:</td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={displayOrder.taxRate}
                        onChange={(e) => {
                          if (editedOrder) {
                            const taxRate = Number(e.target.value);
                            const taxAmount = editedOrder.subtotal * (taxRate / 100);
                            setEditedOrder({
                              ...editedOrder,
                              taxRate,
                              taxAmount,
                              total: editedOrder.subtotal + taxAmount
                            });
                          }
                        }}
                        className="border rounded p-1 w-20 text-right"
                      />
                    ) : (
                      <span className="text-right block">{displayOrder.taxRate}%</span>
                    )}
                  </td>
                  <td className="p-2 text-right">${displayOrder.taxAmount.toFixed(2)}</td>
                  {isEditing && <td></td>}
                </tr>
                <tr className="font-bold">
                  <td colSpan={isEditing ? 3 : 2} className="p-2 text-right">Total:</td>
                  <td className="p-2 text-right">${displayOrder.total.toFixed(2)}</td>
                  {isEditing && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          {isEditing ? (
            <textarea
              value={displayOrder.notes || ''}
              onChange={(e) => {
                if (editedOrder) {
                  setEditedOrder({
                    ...editedOrder,
                    notes: e.target.value
                  });
                }
              }}
              className="border rounded p-2 w-full"
              rows={4}
              placeholder="Add notes here..."
            />
          ) : (
            displayOrder.notes && (
              <div className="bg-gray-50 p-4 rounded">
                {displayOrder.notes}
              </div>
            )
          )}
        </div>

        {/* Delete Button */}
        {!isEditing && (
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleDeleteConfirm}
              className="text-red-600 hover:text-red-700 flex items-center"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete Purchase Order
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete purchase order <span className="font-medium">#{order?.orderNumber}</span>? This action cannot be undone.
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
