import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PurchaseOrder } from '../types';
import { Printer, Mail, ArrowLeft, Edit, Save, X, Trash } from 'lucide-react';
import { usePurchaseOrder } from '../contexts/PurchaseOrderContext';
import { useSettings } from '../contexts/SettingsContext';
import { PurchaseOrderStatus } from '../types';
import NotFound from './NotFound';

const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrder();
  const { settings } = useSettings();
  
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<PurchaseOrderStatus>('pending');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getPurchaseOrder(id || '');
        setOrder(data);
        setStatus(data.status);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOrder();
    }
  }, [id, getPurchaseOrder]);

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
  
  const handleStatusChange = () => {
    updatePurchaseOrder(order.id, { status });
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    deletePurchaseOrder(order.id);
    navigate('/purchase-orders');
  };
  
  const printPurchaseOrder = () => {
    window.print();
  };
  
  const sendPurchaseOrderEmail = () => {
    window.alert(`Purchase order would be emailed to ${order.customer.email}`);
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="mr-1 h-5 w-5" />
          Back
        </button>
        
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={printPurchaseOrder}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <Printer className="mr-2 h-5 w-5" />
                Print
              </button>
              
              <button
                onClick={sendPurchaseOrderEmail}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <Mail className="mr-2 h-5 w-5" />
                Email
              </button>
              
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
              >
                <Edit className="mr-2 h-5 w-5" />
                Edit Status
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <X className="mr-2 h-5 w-5" />
                Cancel
              </button>
              
              <button
                onClick={handleStatusChange}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
              >
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 print:shadow-none print:border-none print:p-4">
        <div className="flex justify-between items-start mb-8 print:mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 print:text-xl">
              Purchase Order #{order.orderNumber}
            </h1>
            <p className="text-gray-500 print:text-sm">
              Created on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="text-right print:absolute print:top-4 print:right-4">
            {isEditing ? (
              <div className="print:hidden">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ) : (
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                order.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : order.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              } print:text-xs print:bg-transparent print:border print:border-current`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-4 print:mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 print:text-base print:mb-2">From</h2>
            <div className="text-gray-700 print:text-sm">
              <p className="font-medium">{settings.companyName}</p>
              <p>{settings.companyAddress}</p>
              <p>{settings.companyPhone}</p>
              <p>{settings.companyEmail}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 print:text-base print:mb-2">To</h2>
            <div className="text-gray-700 print:text-sm">
              <p className="font-medium">{order.customer.name}</p>
              {order.customer.address && <p>{order.customer.address}</p>}
              {order.customer.phone && <p>{order.customer.phone}</p>}
              {order.customer.email && <p>{order.customer.email}</p>}
            </div>
          </div>
        </div>
        
        <div className="mb-8 print:mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 print:text-base print:mb-2">Order Details</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:py-2 print:text-[10px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-gray-700 print:py-2 print:text-sm">
                      {item.description}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700 print:py-2 print:text-sm">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700 print:py-2 print:text-sm">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700 print:py-2 print:text-sm">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700 print:py-2 print:text-sm">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 print:py-2 print:text-sm">
                    ${order.subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700 print:py-2 print:text-sm">
                    Tax ({order.taxRate}%)
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 print:py-2 print:text-sm">
                    ${order.taxAmount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-800 print:py-2 print:text-sm">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800 print:py-2 print:text-sm">
                    ${order.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {order.notes && (
          <div className="mb-8 print:mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 print:text-base print:mb-2">Notes</h2>
            <div className="bg-gray-50 p-4 rounded-md text-gray-700 print:bg-transparent print:p-0 print:text-sm">
              {order.notes}
            </div>
          </div>
        )}
        
        <div className="print:hidden mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800 flex items-center"
            >
              <Trash className="mr-1 h-5 w-5" />
              Delete Purchase Order
            </button>
            
            <div className="text-sm text-gray-500">
              Purchase Order ID: {order.id}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this purchase order? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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