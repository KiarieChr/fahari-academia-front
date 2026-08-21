import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Search, MessageSquare, Phone, User, Loader2 } from 'lucide-react';
import { crmService } from '../../../services/crmService';

export const ParentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [parents, setParents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadParents = async () => {
      try {
        const response = await crmService.getParents();
        // Assuming response has a 'results' array if paginated, or just the array
        setParents(response.results || response);
      } catch (err) {
        console.error("Failed to load parents", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadParents();
  }, []);




  const filteredParents = parents.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Parent Directory">
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0">Parent Directory</h2>
          <p className="text-gray-500">View and manage parent communications</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search parents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-72"
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl shadow-[8px_8px_20px_#e0e5ec,-8px_-8px_20px_#ffffff] border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Parent / Guardian</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Students</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Pref. Channel</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Loading parents...
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No parents found matching "{searchTerm}"
                  </td>
                </tr>
              ) : filteredParents.map(parent => (
                <tr key={parent.id} className="border-b border-gray-100 last:border-0 hover:bg-white/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <User size={20} />
                      </div>
                      <span className="font-semibold text-gray-800">{parent.first_name} {parent.last_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-gray-600">
                      <Phone size={16} className="mr-2" /> {parent.whatsapp_number || parent.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {parent.students && parent.students.length > 0 ? (
                        parent.students.map((s, idx) => <span key={idx} className="text-gray-500 text-sm">• {s}</span>)
                      ) : (
                        <span className="text-gray-400 text-sm">No linked students</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${parent.whatsapp_number ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {parent.whatsapp_number ? 'WHATSAPP' : 'SMS'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                      <MessageSquare size={16} /> Message
                    </button>
                  </td>
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
