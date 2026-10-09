import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { transportService, StudentAssignment, Route } from './services/transportService';
import { AssignmentModal } from './components/AssignmentModal';
import { Plus, Search, Filter, Bus, Users, Ban, Clock, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'ended' | 'all'>('active');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [selectedRoute, statusFilter, searchTerm]);

  const fetchInitialData = async () => {
    try {
      const rRes = await transportService.getRoutes();
      setRoutes(rRes.results || rRes || []);
    } catch (error) {
      toast.error('Failed to load routes');
    }
  };

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedRoute) params.route_id = parseInt(selectedRoute);
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
      if (searchTerm) params.search = searchTerm;

      const res = await transportService.getAssignments(params);
      setAssignments(res.results || res || []);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (window.confirm('Are you sure you want to end this transport assignment?')) {
      try {
        await transportService.deactivateAssignment(id);
        toast.success('Assignment ended successfully');
        fetchAssignments();
      } catch (error: any) {
        toast.error(error.message || 'Failed to end assignment');
      }
    }
  };

  // Metrics calculation
  const metrics = {
    totalAssigned: assignments.filter(a => a.is_active).length,
    totalCapacity: routes.reduce((sum, r) => sum + (r.capacity || 0), 0),
    twoWayCount: assignments.filter(a => a.is_active && a.transport_type === 'two_way').length,
    oneWayCount: assignments.filter(a => a.is_active && a.transport_type !== 'two_way').length,
  };
  const fillRate = metrics.totalCapacity ? Math.round((metrics.totalAssigned / metrics.totalCapacity) * 100) : 0;

  return (
    <DashboardLayout title="Student Transport Assignments">
      <div className="flex justify-between items-center mb-6 p-6 pb-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Transport Assignments</h1>
          <p className="text-gray-500">Manage student routes, stops, and ridership capacity</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Assign Student
        </button>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Assigned Students</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalAssigned}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Bus size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <div>
                <p className="text-sm text-gray-500 font-medium">Bus Capacity Fill Rate</p>
                <p className="text-2xl font-bold text-gray-900">{fillRate}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${fillRate > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(fillRate, 100)}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-medium">Transit Type Split</p>
            <div className="flex justify-between mt-1">
              <div className="text-center">
                <span className="block text-xl font-bold text-gray-900">{metrics.twoWayCount}</span>
                <span className="text-xs text-gray-500">Two-Way</span>
              </div>
              <div className="text-center border-l pl-4">
                <span className="block text-xl font-bold text-gray-900">{metrics.oneWayCount}</span>
                <span className="text-xs text-gray-500">One-Way</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or admission no..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Routes</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.route_name}</option>
              ))}
            </select>
          </div>
          <div className="w-36">
            <select 
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route & Stop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transit Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading assignments...</td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No student assignments found.</td>
                </tr>
              ) : (
                assignments.map((assignment) => {
                  const s = assignment.student_detail || {};
                  const r = assignment.route_detail || {};
                  const st = assignment.stop_detail || {};
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</div>
                        <div className="text-xs text-gray-500">Adm: {s.admission_number} | {s.class_name || s.grade_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-indigo-700">{r.route_name || `Route #${assignment.route}`}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Bus size={12} /> {st.stop_name || `Stop #${assignment.stop}`}
                          {st.pickup_time && ` (${st.pickup_time.substring(0,5)})`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize px-2 py-1 bg-gray-100 rounded">
                          {assignment.transport_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {assignment.is_active ? 'Active' : 'Ended'}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1">Since: {assignment.start_date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {assignment.is_active && (
                          <button 
                            onClick={() => handleDeactivate(assignment.id)} 
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded inline-flex items-center gap-1"
                            title="End Assignment"
                          >
                            <LogOut size={16} /> End
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchAssignments();
        }}
        routes={routes}
      />
    </DashboardLayout>
  );
};
