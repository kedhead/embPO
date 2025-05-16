import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Trash2, Save, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { usePurchaseOrder } from '../contexts/PurchaseOrderContext';
import { useSettings } from '../contexts/SettingsContext';
import { LineItem, Customer } from '../types';

const emptyLineItem = (): LineItem => ({
  id: uuidv4(),
  description: '',
  quantity: 1,
  unitPrice: 0
});

const emptyCustomer = (): Customer => ({
  name: '',
  email: '',
  phone: '',
  address: ''
});

const CreatePurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addPurchaseOrder, calculateTotal } = usePurchaseOrder();
  const { settings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderNumber, setOrderNumber] = useState(() => {
    // Generate PO number based on current date (e.g., PO-20250501-001)
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    
    // Math.random for uniqueness - in a real app you'd use a sequence
    const unique = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${dateStr}-${unique}`;
  });
  
  const [customer, setCustomer] = useState<Customer>(emptyCustomer());
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  
  // Set due date to 30 days from now
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Add 30 days
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  
  const { subtotal, taxAmount, total } = calculateTotal(lineItems, taxRate);
  
  const handleAddLineItem = () => {
    setLineItems([...lineItems, emptyLineItem()]);
  };
  
  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };
  
  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };
  
  const updateCustomer = (field: keyof Customer, value: string) => {
    setCustomer({ ...customer, [field]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate customer name
    if (!customer.name.trim()) {
      alert('Customer name is required');
      return;
    }

    // Validate line items
    const validLineItems = lineItems.filter(item => 
      item.description.trim() && 
      item.quantity > 0 && 
      item.unitPrice > 0
    );

    if (validLineItems.length === 0) {
      alert('At least one valid line item is required (with description, quantity, and price)');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        orderNumber,
        customer: {
          name: customer.name.trim(),
          email: customer.email?.trim() || '',
          phone: customer.phone?.trim() || '',
          address: customer.address?.trim() || ''
        },
        lineItems: validLineItems.map(item => ({
          id: item.id,
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        subtotal: Number(subtotal.toFixed(2)),
        taxRate: Number(taxRate.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
        notes: notes.trim() || '',
        dueDate: dueDate
      };

      console.log('Submitting order data:', orderData);
      await addPurchaseOrder(orderData);
      
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      let errorMessage = 'Error creating purchase order. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Purchase Order</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Purchase Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => updateCustomer('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => updateCustomer('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => updateCustomer('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={customer.address}
                onChange={(e) => updateCustomer('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Line Items</h2>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center text-sm transition-colors duration-200"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item description"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 pl-6 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className={`p-1 rounded-full ${
                          lineItems.length === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-medium text-gray-700">
                    Subtotal
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    ${subtotal.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-medium text-gray-700">
                    Tax ({taxRate}%)
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    ${taxAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-bold text-gray-800">
                    Total
                  </td>
                  <td className="px-3 py-2 font-bold text-gray-800">
                    ${total.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes or special instructions..."
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;