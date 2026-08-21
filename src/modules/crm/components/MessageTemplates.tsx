import React from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { LayoutTemplate } from 'lucide-react';

export const MessageTemplates: React.FC = () => {
  return (
    <DashboardLayout title="Message Templates">
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 m-0">Message Templates</h2>
            <p className="text-gray-500">Manage pre-approved WhatsApp and SMS templates</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-[60vh] bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[8px_8px_20px_#e0e5ec,-8px_-8px_20px_#ffffff]">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
            <LayoutTemplate size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Templates Coming Soon</h3>
          <p className="text-gray-500 max-w-md text-center">
            This module will allow you to build and sync templates directly from Twilio and Africa's Talking.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
