import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Settings, Plus, List } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-700 rounded-lg ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
            } transition-colors duration-200`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/create"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-700 rounded-lg ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
            } transition-colors duration-200`
          }
        >
          <Plus className="mr-3 h-5 w-5" />
          <span>Create Purchase Order</span>
        </NavLink>
        
        <NavLink
          to="/purchase-orders"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-700 rounded-lg ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
            } transition-colors duration-200`
          }
        >
          <List className="mr-3 h-5 w-5" />
          <span>Purchase Orders</span>
        </NavLink>
        
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-gray-700 rounded-lg ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
            } transition-colors duration-200`
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;