import React, { useState, useEffect } from 'react';
import { Route, FeeStructure, transportService } from '../services/transportService';
import { X } from 'lucide-react';

interface FeeStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FeeStructure>[]) => void;
  route: Route | null;
  academicYearId: number;
  termId: number;
  initialStructures?: FeeStructure[];
}

export const FeeStructureModal: React.FC<FeeStructureModalProps> = ({ isOpen, onClose, onSave, route, academicYearId, termId, initialStructures = [] }) => {
  // We'll store amounts in a map where key is fee_type.
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [billingCycle, setBillingCycle] = useState('per_term');

  useEffect(() => {
    if (isOpen && route) {
      const initialAmounts: Record<string, number> = {};
      let cycle = 'per_term';
      initialStructures.forEach(fs => {
        initialAmounts[fs.fee_type] = fs.amount;
        cycle = fs.billing_cycle;
      });
      setAmounts(initialAmounts);
      setBillingCycle(cycle);
    }
  }, [isOpen, route, initialStructures]);

  if (!isOpen || !route) return null;

  const getFields = () => {
    if (route.fee_model === 'flat_per_route') return [{ value: 'flat', label: 'Flat Rate' }];
    if (route.fee_model === 'per_zone') return [
      { value: 'near_zone', label: 'Near Zone' },
      { value: 'mid_zone', label: 'Mid Zone' },
      { value: 'far_zone', label: 'Far Zone' }
    ];
    if (route.fee_model === 'one_way_two_way') return [
      { value: 'one_way', label: 'One-Way Fee (KES)' },
      { value: 'two_way', label: 'Two-Way Fee (KES)' }
    ];
    return [];
  };

  const handleAmountChange = (feeType: string, value: string) => {
    const num = parseFloat(value);
    setAmounts(prev => ({ ...prev, [feeType]: isNaN(num) ? 0 : num }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fields = getFields();
    
    // We only send the ones that are >= 0. Or maybe we require them to be >= 0.
    const toSave: Partial<FeeStructure>[] = [];
    
    for (const field of fields) {
      const amount = amounts[field.value] || 0;
      if (amount < 0) {
        alert("Amount must be >= 0");
        return;
      }
      
      const existing = initialStructures.find(fs => fs.fee_type === field.value);
      
      toSave.push({
        id: existing?.id,
        route: route.id,
        fee_type: field.value,
        amount: amount,
        billing_cycle: billingCycle,
        academic_year: academicYearId,
        term: termId
      });
    }

    onSave(toSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Configure Fees - {route.route_name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
            <select 
              value={billingCycle} 
              onChange={(e) => setBillingCycle(e.target.value)} 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="per_term">Per Term</option>
              <option value="per_month">Per Month</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Rates</label>
            {getFields().map((field) => (
              <div key={field.value} className="flex items-center gap-4">
                <span className="w-1/3 text-sm text-gray-600">{field.label}</span>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">KES</span>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={amounts[field.value] !== undefined ? amounts[field.value] : ''} 
                    onChange={(e) => handleAmountChange(field.value, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-12 p-2 border" 
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Rates</button>
          </div>
        </form>
      </div>
    </div>
  );
};
