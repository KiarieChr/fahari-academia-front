import React, { useState, useEffect } from 'react';
import { Route, transportService } from '../services/transportService';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Route>) => void;
  initialData?: Route | null;
}

export const RouteModal: React.FC<RouteModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const [formData, setFormData] = useState<Partial<Route>>({
    route_code: '',
    route_name: '',
    direction: 'two_way',
    vehicle_registration: '',
    driver_name: '',
    driver_phone: '',
    capacity: 0,
    fee_model: 'flat_per_route',
    status: 'active',
  });

  useEffect(() => {
    if (isOpen) {
      transportService.getFleetVehicles().then(res => setVehicles(res.results || res || [])).catch(() => toast.error('Failed to load fleet vehicles'));
      transportService.getFleetDrivers().then(res => setDrivers(res.results || res || [])).catch(() => toast.error('Failed to load fleet drivers'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        route_code: '',
        route_name: '',
        direction: 'two_way',
        vehicle_registration: '',
        driver_name: '',
        driver_phone: '',
        capacity: 0,
        fee_model: 'flat_per_route',
        status: 'active',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reg = e.target.value;
    const vehicle = vehicles.find(v => v.registration_number === reg);
    setFormData(prev => ({
      ...prev,
      vehicle_registration: reg,
      capacity: vehicle && vehicle.capacity > 0 ? vehicle.capacity : prev.capacity
    }));
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const driverName = e.target.value;
    const driver = drivers.find(d => {
      const name = d.employee_name || d.license_number;
      return name === driverName;
    });
    setFormData(prev => ({
      ...prev,
      driver_name: driverName,
      driver_phone: driver?.phone_number || prev.driver_phone || '' // Assuming there might be a phone_number somewhere, else fallback
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{initialData ? 'Edit Route' : 'Add New Route'}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Route Code</label>
              <input type="text" name="route_code" value={formData.route_code || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Route Name</label>
              <input type="text" name="route_name" value={formData.route_name || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Direction</label>
              <select name="direction" value={formData.direction || 'two_way'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                <option value="two_way">Two Way</option>
                <option value="morning_only">Morning Only</option>
                <option value="evening_only">Evening Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fee Model</label>
              <select name="fee_model" value={formData.fee_model || 'flat_per_route'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                <option value="flat_per_route">Flat Per Route</option>
                <option value="per_zone">Per Zone</option>
                <option value="one_way_two_way">One Way vs Two Way</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Reg</label>
              {vehicles.length > 0 ? (
                <select name="vehicle_registration" value={formData.vehicle_registration || ''} onChange={handleVehicleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                  <option value="">Select Vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.registration_number}>{v.registration_number} ({v.capacity} seats)</option>
                  ))}
                  {formData.vehicle_registration && !vehicles.find(v => v.registration_number === formData.vehicle_registration) && (
                    <option value={formData.vehicle_registration}>{formData.vehicle_registration} (Legacy)</option>
                  )}
                </select>
              ) : (
                <input type="text" name="vehicle_registration" value={formData.vehicle_registration || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Driver Name</label>
              {drivers.length > 0 ? (
                <select name="driver_name" value={formData.driver_name || ''} onChange={handleDriverChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                  <option value="">Select Driver...</option>
                  {drivers.map(d => {
                    const name = d.employee_name || d.license_number;
                    return <option key={d.id} value={name}>{name}</option>;
                  })}
                  {formData.driver_name && !drivers.find(d => (d.employee_name || d.license_number) === formData.driver_name) && (
                    <option value={formData.driver_name}>{formData.driver_name} (Legacy)</option>
                  )}
                </select>
              ) : (
                <input type="text" name="driver_name" value={formData.driver_name || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Driver Phone</label>
              <input type="text" name="driver_phone" value={formData.driver_phone || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input type="number" name="capacity" value={formData.capacity || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={formData.status || 'active'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Route</button>
          </div>
        </form>
      </div>
    </div>
  );
};
