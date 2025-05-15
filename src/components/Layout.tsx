import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSettings } from '../contexts/SettingsContext';

const Layout: React.FC = () => {
  const { settings } = useSettings();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar companyName={settings.companyName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;