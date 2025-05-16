import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    companyAddress: settings.companyAddress,
    companyPhone: settings.companyPhone,
    companyEmail: settings.companyEmail,
    taxRate: settings.taxRate.toString(),
    companyLogo: settings.companyLogo || ''
  });
  
  const [isSaved, setIsSaved] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSettings({
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companyPhone: formData.companyPhone,
      companyEmail: formData.companyEmail,
      taxRate: parseFloat(formData.taxRate) || 0,
      companyLogo: formData.companyLogo
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  useEffect(() => {
    // Fetch existing company settings
    setFormData({
      companyName: settings.companyName,
      companyAddress: settings.companyAddress,
      companyPhone: settings.companyPhone,
      companyEmail: settings.companyEmail,
      taxRate: settings.taxRate.toString(),
      companyLogo: settings.companyLogo || ''
    });
  }, [settings]);
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <textarea
                id="companyAddress"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="companyPhone"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo URL (optional)
              </label>
              <input
                type="url"
                id="companyLogo"
                name="companyLogo"
                value={formData.companyLogo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a full URL to your company logo image
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Settings</h2>
          
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
              Default Tax Rate (%)
            </label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              min="0"
              step="0.01"
              value={formData.taxRate}
              onChange={handleChange}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be the default tax rate for new purchase orders
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          {isSaved && (
            <span className="text-green-600 flex items-center">
              <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Settings saved successfully!
            </span>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
          >
            <Save className="mr-2 h-5 w-5" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;