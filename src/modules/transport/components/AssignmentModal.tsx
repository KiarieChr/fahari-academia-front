import React, { useState, useEffect } from 'react';
import { Route, Stop, transportService } from '../services/transportService';
import { studentManagementService } from '../../../services/studentManagementService';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  routes: Route[];
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onSuccess, routes }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | ''>('');
  const [selectedStopId, setSelectedStopId] = useState<number | ''>('');
  const [transportType, setTransportType] = useState('two_way');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [stops, setStops] = useState<Stop[]>([]);
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchStudents(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (selectedRouteId) {
      fetchStops(selectedRouteId as number);
    } else {
      setStops([]);
      setSelectedStopId('');
    }
  }, [selectedRouteId]);

  const searchStudents = async (term: string) => {
    try {
      // Assuming getStudents takes a query param for search
      const res = await studentManagementService.getStudents(1, 10, term);
      setStudents(res.results || res.data || []);
    } catch (error) {
      console.error('Failed to search students');
    }
  };

  const fetchStops = async (routeId: number) => {
    try {
      const res = await transportService.getStops(routeId);
      setStops(res || []);
      if (res && res.length > 0) {
        setSelectedStopId(res[0].id);
      }
    } catch (error) {
      toast.error('Failed to load stops');
    }
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const capacityPct = selectedRoute?.capacity_percentage || 0;
  const isFull = capacityPct >= 100;
  const isWarning = capacityPct >= 90 && !isFull;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRouteId || !selectedStopId) {
      toast.error('Please select student, route and stop');
      return;
    }

    if (isFull && !overrideCapacity) {
      toast.error('Route is full. Admin override is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await transportService.createAssignment({
        student: selectedStudent.student_id || selectedStudent.id,
        route: selectedRouteId as number,
        stop: selectedStopId as number,
        transport_type: transportType,
        start_date: startDate,
        is_active: true,
        override_capacity: overrideCapacity
      });
      toast.success('Student assigned successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign student');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Assign Student to Transport</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Selection */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">1. Select Student</h3>
            {!selectedStudent ? (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search student by name or admission number (min 3 chars)..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-4 py-2 rounded border border-gray-300 focus:border-blue-500"
                />
                {students.length > 0 && searchTerm.length > 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                    {students.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => setSelectedStudent(s)}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium text-sm">{s.first_name} {s.last_name}</div>
                        <div className="text-xs text-gray-500">Adm: {s.admission_number} | Class: {s.class_name || s.grade_name || s.current_grade_name || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center bg-white p-3 rounded border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {selectedStudent.first_name?.[0]}
                  </div>
                  <div>
                    <div className="font-medium">{selectedStudent.first_name} {selectedStudent.last_name}</div>
                    <div className="text-xs text-gray-500">Adm: {selectedStudent.admission_number}</div>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedStudent(null); setSearchTerm(''); }} className="text-red-500 text-sm hover:underline">Change</button>
              </div>
            )}
          </div>

          {/* Route Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
            <h3 className="text-sm font-medium text-gray-700">2. Transport Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Route *</label>
                <select 
                  value={selectedRouteId} 
                  onChange={(e) => setSelectedRouteId(parseInt(e.target.value) || '')} 
                  required
                  className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Route...</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.route_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stop *</label>
                <select 
                  value={selectedStopId} 
                  onChange={(e) => setSelectedStopId(parseInt(e.target.value) || '')} 
                  required
                  disabled={!selectedRouteId}
                  className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">Select Stop...</option>
                  {stops.map(s => (
                    <option key={s.id} value={s.id}>{s.stop_name} {s.pickup_time ? `(${s.pickup_time.substring(0,5)})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Transit Type *</label>
                <select 
                  value={transportType} 
                  onChange={(e) => setTransportType(e.target.value)} 
                  className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 text-sm"
                >
                  <option value="two_way">Two Way</option>
                  <option value="morning_only">Morning Only</option>
                  <option value="evening_only">Evening Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date *</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required
                  className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Capacity Alerts */}
            {selectedRoute && (
              <div className="mt-4 p-3 rounded bg-white border">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Route Capacity: {selectedRoute.active_student_count || 0} / {selectedRoute.capacity} seats</span>
                  <span className={`font-bold ${isFull ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-green-600'}`}>
                    {capacityPct}%
                  </span>
                </div>
                
                {isWarning && !isFull && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 text-orange-800 text-xs rounded flex items-center gap-2">
                    <AlertTriangle size={14} /> Route is nearing maximum capacity ({capacityPct}%).
                  </div>
                )}

                {isFull && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 text-red-800 text-sm font-bold mb-2">
                      <AlertTriangle size={16} /> Route is Full ({capacityPct}%)
                    </div>
                    <label className="flex items-start gap-2 text-sm text-gray-700">
                      <input 
                        type="checkbox" 
                        checked={overrideCapacity} 
                        onChange={(e) => setOverrideCapacity(e.target.checked)} 
                        className="mt-1"
                      />
                      <span>Admin Override Capacity (Force assignment despite capacity limit)</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting || (!overrideCapacity && isFull)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
