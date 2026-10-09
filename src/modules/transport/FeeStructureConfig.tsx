import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { transportService, Route, FeeStructure } from './services/transportService';
import studentSettingsService from '../../services/studentSettingsService';
import { FeeStructureModal } from './components/FeeStructureModal';
import { Settings, AlertCircle, Edit, Banknote } from 'lucide-react';
import { toast } from 'react-toastify';

export const FeeStructureConfig: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedTerm, setSelectedTerm] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedTerm) {
      fetchFeeStructures();
    }
  }, [selectedYear, selectedTerm]);

  const fetchBaseData = async () => {
    setIsLoading(true);
    try {
      const [rRes, yRes, tRes] = await Promise.all([
        transportService.getRoutes(),
        studentSettingsService.getAcademicYears(),
        studentSettingsService.getTerms()
      ]);
      setRoutes(rRes.results || rRes || []);
      
      const years = yRes.results || yRes || [];
      const trms = tRes.results || tRes || [];
      setAcademicYears(years);
      setTerms(trms);

      // Auto-select active year/term if available
      const activeYear = years.find((y: any) => y.is_active);
      const activeTerm = trms.find((t: any) => t.is_active || t.current_term);
      
      if (activeYear) setSelectedYear(activeYear.id);
      else if (years.length) setSelectedYear(years[0].id);

      if (activeTerm) setSelectedTerm(activeTerm.id);
      else if (trms.length) setSelectedTerm(trms[0].id);

    } catch (error) {
      toast.error('Failed to load base configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeeStructures = async () => {
    if (!selectedYear || !selectedTerm) return;
    try {
      const res = await transportService.getFeeStructures({ academic_year_id: selectedYear, term_id: selectedTerm });
      setFeeStructures(res.results || res || []);
    } catch (error) {
      toast.error('Failed to load fee structures');
    }
  };

  const handleConfigureRoute = (route: Route) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
  };

  const handleSaveStructures = async (structures: Partial<FeeStructure>[]) => {
    try {
      // For simplicity, we create/update one by one or create a bulk endpoint.
      // Here we will do them sequentially.
      for (const st of structures) {
        if (st.id) {
          await transportService.updateFeeStructure(st.id, st);
        } else {
          await transportService.createFeeStructure(st);
        }
      }
      toast.success('Fee rates saved successfully');
      setIsModalOpen(false);
      fetchFeeStructures();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save fee structures');
    }
  };

  // Group structures by route
  const getStructuresForRoute = (routeId: number) => {
    return feeStructures.filter(fs => fs.route === routeId);
  };

  return (
    <DashboardLayout title="Fee Structure Configuration">
      <div className="flex justify-between items-center mb-6 p-6 pb-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structure Configuration</h1>
          <p className="text-gray-500">Manage transport pricing across different routes and terms</p>
        </div>
      </div>

      {/* Top filter bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || '')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
          >
            <option value="">Select Year...</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.name || y.year}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
          <select 
            value={selectedTerm} 
            onChange={(e) => setSelectedTerm(parseInt(e.target.value) || '')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
          >
            <option value="">Select Term...</option>
            {terms.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <button 
            onClick={() => {
              if (!selectedYear || !selectedTerm) {
                toast.error('Select Academic Year and Term first.');
                return;
              }
              setIsBillingModalOpen(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 font-medium"
          >
            <Banknote size={18} />
            Generate Term Charges
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading configurations...</div>
      ) : (!selectedYear || !selectedTerm) ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
          Please select an Academic Year and Term to configure fees.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configured Rates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => {
                const routeStructures = getStructuresForRoute(route.id);
                const isConfigured = routeStructures.length > 0;
                
                return (
                  <tr key={route.id} className={!isConfigured ? 'bg-orange-50/30' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{route.route_name}</div>
                      <div className="text-xs text-gray-500">Code: {route.route_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize px-2 py-1 bg-gray-100 rounded">
                        {route.fee_model.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isConfigured ? (
                        <div className="space-y-1">
                          {routeStructures.map(fs => (
                            <div key={fs.id} className="text-sm flex justify-between gap-4">
                              <span className="text-gray-500 capitalize">{fs.fee_type.replace('_', ' ')}</span>
                              <span className="font-medium">KES {fs.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="text-xs text-blue-600 mt-1 capitalize border-t pt-1">
                            Billed: {routeStructures[0].billing_cycle.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-orange-500 flex items-center gap-1 italic">
                          <AlertCircle size={14} /> Unconfigured
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isConfigured ? 'Ready for Billing' : 'Setup Required'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleConfigureRoute(route)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded inline-flex items-center gap-1"
                      >
                        <Settings size={16} /> Configure
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedYear && selectedTerm && (
        <FeeStructureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveStructures}
          route={selectedRoute}
          academicYearId={selectedYear as number}
          termId={selectedTerm as number}
          initialStructures={selectedRoute ? getStructuresForRoute(selectedRoute.id) : []}
        />
      )}

      {selectedYear && selectedTerm && isBillingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Generate Transport Charges</h2>
            <p className="text-gray-600 text-sm mb-4">
              This will calculate and post transport fees for all active riders in the selected term.
              Duplicate charges will be skipped. 
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm border space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Academic Year:</span>
                <span className="font-medium">{academicYears.find(y => y.id === selectedYear)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Term:</span>
                <span className="font-medium">{terms.find(t => t.id === selectedTerm)?.name}</span>
              </div>
            </div>

            <div className="mb-6 flex items-start gap-2">
              <input 
                type="checkbox" 
                id="enable_prorating" 
                className="mt-1" 
                defaultChecked 
              />
              <label htmlFor="enable_prorating" className="text-sm">
                <span className="font-medium block text-gray-900">Enable Pro-Rating</span>
                <span className="text-gray-500 block">Late joiners after Week 2 will be charged a pro-rated fee rounded to nearest KES 50. Unchecking bills the full term fee for all active riders regardless of join date.</span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsBillingModalOpen(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    const enableProrating = (document.getElementById('enable_prorating') as HTMLInputElement).checked;
                    const res = await transportService.generateCharges({ 
                      academic_year_id: selectedYear as number, 
                      term_id: selectedTerm as number,
                      enable_prorating: enableProrating
                    });
                    toast.success(`Processed: ${res.total_processed}. Prorated: ${res.prorated_count}. Full term: ${res.full_term_count || 0}. Skipped: ${res.skipped_duplicates}`);
                    setIsBillingModalOpen(false);
                  } catch (e: any) {
                    toast.error(e.response?.data?.detail || e.message || 'Failed to generate charges');
                  }
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Banknote size={16} /> Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

