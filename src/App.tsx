import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PurchaseOrderProvider } from './contexts/PurchaseOrderContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import PurchaseOrderList from './pages/PurchaseOrderList';
import PurchaseOrderDetails from './pages/PurchaseOrderDetails';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <SettingsProvider>
        <PurchaseOrderProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/create" element={<CreatePurchaseOrder />} />
              <Route path="/purchase-orders" element={<PurchaseOrderList />} />
              <Route path="/purchase-orders/:id" element={<PurchaseOrderDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </PurchaseOrderProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;