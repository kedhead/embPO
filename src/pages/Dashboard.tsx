import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, FileText } from 'lucide-react';
import { usePurchaseOrder } from '../contexts/PurchaseOrderContext';

const Dashboard: React.FC = () => {
  const { purchaseOrders } = usePurchaseOrder();
    const recentOrders = purchaseOrders.slice(-5).reverse();
  
  const totalSales = purchaseOrders.reduce((sum, order) => sum + order.total, 0);
  const unpaidOrders = purchaseOrders.filter(o => o.status === 'unpaid').length;
  const paidOrders = purchaseOrders.filter(o => o.status === 'paid').length;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link 
          to="/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          New Purchase Order
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-800">
                ${totalSales.toFixed(2)}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {paidOrders}
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <List className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Unpaid Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {unpaidOrders}
              </h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Purchase Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <Link 
                key={order.id} 
                to={`/purchase-orders/${order.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      PO #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer.name} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'unpaid' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : order.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="ml-4 font-medium">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No purchase orders yet</p>
              <Link 
                to="/create" 
                className="mt-4 inline-block text-blue-600 hover:text-blue-700"
              >
                Create your first purchase order
              </Link>
            </div>
          )}
        </div>
        {recentOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <Link 
              to="/purchase-orders" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all purchase orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;