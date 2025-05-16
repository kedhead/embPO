import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const CompanyHeader: React.FC = () => {
  const { settings } = useSettings();

  return (    <div className="hidden print:block print:mb-4 print:-mt-4">
      <div className="text-center border-b border-gray-300 pb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{settings.companyName}</h1>
        <div className="text-gray-600 text-sm">
          <p className="mb-0.5">{settings.companyAddress}</p>
          <p className="flex items-center justify-center space-x-4">
            <span>{settings.companyPhone}</span>
            <span className="text-gray-300">|</span>
            <span>{settings.companyEmail}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
