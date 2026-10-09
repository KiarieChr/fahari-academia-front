import React, { useState, useEffect } from 'react';
import { Route, Stop, transportService } from '../services/transportService';
import { X, Trash2, Edit2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

interface StopListModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
}

export const StopListModal: React.FC<StopListModalProps> = ({ isOpen, onClose, route }) => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStop, setEditingStop] = useState<Partial<Stop> | null>(null);

  useEffect(() => {
    if (isOpen && route) {
      fetchStops();
    }
  }, [isOpen, route]);

  const fetchStops = async () => {
    if (!route) return;
    setIsLoading(true);
    try {
      const response = await transportService.getStops(route.id);
      const data = response.results || response || [];
      setStops(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load stops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this stop?')) {
      try {
        await transportService.deleteStop(id);
        toast.success('Stop deleted successfully');
        fetchStops();
      } catch (error) {
        toast.error('Failed to delete stop');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop || !route) return;

    try {
      const payload = { ...editingStop, route: route.id };
      if (editingStop.id) {
        await transportService.updateStop(editingStop.id, payload);
        toast.success('Stop updated successfully');
      } else {
        await transportService.createStop(payload);
        toast.success('Stop created successfully');
      }
      setEditingStop(null);
      fetchStops();
    } catch (error) {
      toast.error('Failed to save stop');
    }
  };

  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Manage Stops - {route.route_name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex gap-6">
          {/* Left side: List of stops */}
          <div className="flex-1">
            <div className="flex justify-between mb-4">
              <h3 className="font-medium text-lg">Current Stops</h3>
              <button 
                onClick={() => setEditingStop({ stop_order: stops.length + 1, zone: 'near' })}
                className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
              >
                <Plus size={16} /> Add Stop
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : stops.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">No stops configured for this route.</div>
            ) : (
              <div className="space-y-2">
                {stops.sort((a, b) => a.stop_order - b.stop_order).map((stop) => (
                  <div key={stop.id} className="flex items-center justify-between p-3 border rounded hover:shadow-sm transition-shadow bg-white">
                    <div className="flex items-center gap-4">
                      <span className="bg-gray-100 text-gray-600 font-medium px-2 py-1 rounded text-sm min-w-[32px] text-center">
                        {stop.stop_order}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{stop.stop_name}</div>
                        <div className="text-sm text-gray-500 flex gap-3">
                          <span className="capitalize text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{stop.zone} Zone</span>
                          {stop.pickup_time && <span>Pickup: {stop.pickup_time.substring(0, 5)}</span>}
                          {stop.dropoff_time && <span>Drop: {stop.dropoff_time.substring(0, 5)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingStop(stop)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(stop.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side: Editor */}
          {editingStop && (
            <div className="w-1/3 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium mb-4">{editingStop.id ? 'Edit Stop' : 'Add New Stop'}</h3>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Stop Name *</label>
                  <input type="text" value={editingStop.stop_name || ''} onChange={(e) => setEditingStop({...editingStop, stop_name: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Order *</label>
                    <input type="number" value={editingStop.stop_order || 1} onChange={(e) => setEditingStop({...editingStop, stop_order: parseInt(e.target.value)})} required min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Zone</label>
                    <select value={editingStop.zone || 'near'} onChange={(e) => setEditingStop({...editingStop, zone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border">
                      <option value="near">Near</option>
                      <option value="mid">Mid</option>
                      <option value="far">Far</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Pickup Time</label>
                    <input type="time" value={editingStop.pickup_time || ''} onChange={(e) => setEditingStop({...editingStop, pickup_time: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Dropoff Time</label>
                    <input type="time" value={editingStop.dropoff_time || ''} onChange={(e) => setEditingStop({...editingStop, dropoff_time: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Landmarks / Notes</label>
                  <textarea value={editingStop.landmark_description || ''} onChange={(e) => setEditingStop({...editingStop, landmark_description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border" rows={3} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700">Save</button>
                  <button type="button" onClick={() => setEditingStop(null)} className="flex-1 bg-white border text-gray-700 py-1.5 rounded text-sm hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
