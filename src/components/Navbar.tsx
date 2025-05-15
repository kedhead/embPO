import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  companyName: string;
}

const Navbar: React.FC<NavbarProps> = ({ companyName }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">{companyName}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-blue-100">Billing System</span>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-white hover:text-blue-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-white hover:bg-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/create" 
              className="block px-3 py-2 rounded-md text-white hover:bg-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Purchase Order
            </Link>
            <Link 
              to="/purchase-orders" 
              className="block px-3 py-2 rounded-md text-white hover:bg-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Purchase Orders
            </Link>
            <Link 
              to="/settings" 
              className="block px-3 py-2 rounded-md text-white hover:bg-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;