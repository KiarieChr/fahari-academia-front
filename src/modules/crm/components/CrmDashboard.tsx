import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Smartphone,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { crmService } from '../../../services/crmService';

export const CrmDashboard: React.FC = () => {
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await crmService.getCampaigns();
        setRecentCampaigns(response.results || response);
      } catch (err) {
        console.error("Failed to load CRM data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <DashboardLayout title="CRM Dashboard">
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0">CRM & Communications</h2>
          <p className="text-gray-500">Manage parent engagement and multi-channel campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-[8px_8px_16px_#e0e5ec,-8px_-8px_16px_#ffffff] border border-white/50">
          <div className="flex items-center gap-4">
            <Users className="text-indigo-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 font-medium mb-1">Active Parents</p>
              <h3 className="text-2xl font-bold text-gray-800 m-0">1,284</h3>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-[8px_8px_16px_#e0e5ec,-8px_-8px_16px_#ffffff] border border-white/50">
          <div className="flex items-center gap-4">
            <Send className="text-blue-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 font-medium mb-1">Messages Sent</p>
              <h3 className="text-2xl font-bold text-gray-800 m-0">14,592</h3>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-[8px_8px_16px_#e0e5ec,-8px_-8px_16px_#ffffff] border border-white/50">
          <div className="flex items-center gap-4">
            <MessageSquare className="text-emerald-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 font-medium mb-1">Delivery Rate</p>
              <h3 className="text-2xl font-bold text-emerald-500 m-0">98.2%</h3>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md shadow-[inset_4px_4px_8px_#e0e5ec,inset_-4px_-4px_8px_#ffffff] border border-white/50">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-red-500 w-8 h-8" />
            <div>
              <p className="text-gray-500 font-medium mb-1">Failed Deliveries</p>
              <h3 className="text-2xl font-bold text-red-500 m-0">24</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-xl shadow-[8px_8px_20px_#e0e5ec,-8px_-8px_20px_#ffffff] border border-white/80">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Recent Campaigns</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Campaign Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Channel</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Recipients</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Loading campaigns...
                  </td>
                </tr>
              ) : recentCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No campaigns found
                  </td>
                </tr>
              ) : recentCampaigns.map(camp => (
                <tr key={camp.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-4 text-gray-800 font-medium">{camp.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${camp.channel === 'WHATSAPP' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {camp.channel === 'WHATSAPP' ? <Smartphone size={14} /> : <MessageSquare size={14} />}
                      {camp.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      camp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 
                      camp.status === 'PROCESSING' || camp.status === 'SENDING' ? 'bg-indigo-100 text-indigo-800' : 
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{camp.total_recipients || 0}</td>
                  <td className="py-3 px-4 text-gray-600">{new Date(camp.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};
