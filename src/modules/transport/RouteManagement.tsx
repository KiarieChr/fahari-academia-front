import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { transportService, Route } from './services/transportService';
import { RouteModal } from './components/RouteModal';
import { StopListModal } from './components/StopListModal';
import { Plus, Edit, MapPin, Trash2, Bus, Users, Settings, Download } from 'lucide-react';
import { toast } from 'react-toastify';

export const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await transportService.getRoutes();
      setRoutes(response.results || response || []);
    } catch (error) {
      toast.error('Failed to load transport routes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoute = () => {
    setSelectedRoute(null);
    setIsRouteModalOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setIsRouteModalOpen(true);
  };

  const handleManageStops = (route: Route) => {
    setSelectedRoute(route);
    setIsStopModalOpen(true);
  };

  const handleDeleteRoute = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this route? This will affect fee structures and assignments.')) {
      try {
        await transportService.deleteRoute(id);
        toast.success('Route deleted successfully');
        fetchRoutes();
      } catch (error) {
        toast.error('Failed to delete route. Ensure no students are assigned.');
      }
    }
  };

  const handleSaveRoute = async (routeData: Partial<Route>) => {
    try {
      if (selectedRoute?.id) {
        await transportService.updateRoute(selectedRoute.id, routeData);
        toast.success('Route updated successfully');
      } else {
        await transportService.createRoute(routeData);
        toast.success('Route created successfully');
      }
      setIsRouteModalOpen(false);
      fetchRoutes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save route');
    }
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const summary = {
    totalRoutes: routes.filter(r => r.status === 'active').length,
    totalVehicles: new Set(routes.map(r => r.vehicle_registration).filter(Boolean)).size,
    totalCapacity: routes.reduce((acc, r) => acc + (r.capacity || 0), 0),
    usedCapacity: routes.reduce((acc, r) => acc + (r.active_student_count || 0), 0),
  };
  const utilPct = summary.totalCapacity ? Math.round((summary.usedCapacity / summary.totalCapacity) * 100) : 0;

  return (
    <DashboardLayout title="Transport Management">
      <div className="flex justify-between items-center mb-6 p-6 pb-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
          <p className="text-gray-500">Manage fleet routes, stops, and capacities</p>
        </div>
        <button
          onClick={handleCreateRoute}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add New Route
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Settings size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Routes</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalRoutes}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Bus size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fleet Size (Vehicles)</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalVehicles}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <div>
                <p className="text-sm text-gray-500 font-medium">Capacity Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{utilPct}%</p>
              </div>
              <p className="text-xs text-gray-500">{summary.usedCapacity} / {summary.totalCapacity}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${getCapacityColor(utilPct)}`} style={{ width: `${Math.min(utilPct, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction & Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fleet & Crew</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading routes...</td>
                </tr>
              ) : routes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No transport routes found.</td>
                </tr>
              ) : (
                routes.map((route) => {
                  const capacityPct = route.capacity_percentage || 0;
                  return (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{route.route_name}</div>
                        <div className="text-sm text-gray-500">Code: {route.route_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{route.direction.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500 capitalize">{route.fee_model.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Bus size={14} className="text-gray-400" /> {route.vehicle_registration || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{route.driver_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-48">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{route.active_student_count || 0} enrolled</span>
                          <span className="text-gray-500">of {route.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${getCapacityColor(capacityPct)}`} style={{ width: `${Math.min(capacityPct, 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          route.status === 'active' ? 'bg-green-100 text-green-800' :
                          route.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleManageStops(route)} className="text-indigo-600 hover:text-indigo-900 p-1 bg-indigo-50 rounded" title="Manage Stops">
                            <MapPin size={18} />
                          </button>
                          <button onClick={async () => {
                            try {
                              toast.info('Generating manifest...');
                              const blob = await transportService.getRouteManifest(route.id!);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `manifest_route_${route.route_code}.csv`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (e) {
                              toast.error('Failed to download manifest');
                            }
                          }} className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded" title="Download Manifest">
                            <Download size={18} />
                          </button>
                          <button onClick={() => handleEditRoute(route)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Edit Route">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteRoute(route.id!)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded" title="Delete Route">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        onSave={handleSaveRoute}
        initialData={selectedRoute}
      />

      <StopListModal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        route={selectedRoute}
      />
    </DashboardLayout>
  );
};
