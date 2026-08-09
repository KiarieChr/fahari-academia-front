import React, { useState, useEffect } from 'react';
import procurementApi from '../../../../services/procurementApiService';
import { toast } from 'react-toastify';

const POCreateModal = ({ onClose = () => {}, onCreated = () => {} }) => {
  const [form, setForm] = useState({
    supplier: '',
    order_date: new Date().toISOString().slice(0, 10),
    expected_delivery_date: '',
    delivery_address: '',
    payment_terms: '',
    lines: [{ description: '', quantity: 1, unit_of_measure: 'Pcs', unit_price: 0, vat_rate: 16 }],
  });
  const [suppliers, setSuppliers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const { default: api } = await import('../../../../services/api');
        const res = await api.get('/api/payables/suppliers/');
        setSuppliers(res.results || res || []);
      } catch { /* ignore */ }
    };
    loadSuppliers();
  }, []);

  const addLine = () => {
    setForm(f => ({ ...f, lines: [...f.lines, { description: '', quantity: 1, unit_of_measure: 'Pcs', unit_price: 0, vat_rate: 16 }] }));
  };

  const removeLine = (i) => {
    setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  };

  const updateLine = (i, field, val) => {
    setForm(f => {
      const lines = [...f.lines];
      lines[i] = { ...lines[i], [field]: val };
      return { ...f, lines };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.supplier) return toast.error('Select a supplier');
    if (!form.lines.length || !form.lines[0].description) return toast.error('Add at least one line item');
    setSubmitting(true);
    try {
      await procurementApi.purchaseOrders.create(form);
      toast.success('Purchase Order created');
      onCreated();
    } catch (err) {
      toast.error(err?.data?.detail || 'Failed to create PO');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="po-modal modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h5 className="text-lg font-bold">Create Purchase Order</h5>
          <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={onClose}>&times;</button>
        </div>
        <form className="p-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium mb-1">Supplier *</label>
            <select className="w-full p-2 border rounded-lg" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} required>
              <option value="">Select supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PO Date</label>
              <input type="date" className="w-full p-2 border rounded-lg" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Delivery</label>
              <input type="date" className="w-full p-2 border rounded-lg" value={form.expected_delivery_date} onChange={e => setForm({ ...form, expected_delivery_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Address</label>
            <input type="text" className="w-full p-2 border rounded-lg" value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} />
          </div>

          {/* Lines */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Line Items</label>
              <button type="button" className="text-sm text-blue-600 hover:underline" onClick={addLine}>+ Add Line</button>
            </div>
            {form.lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-4">
                  <input placeholder="Description" className="w-full p-2 border rounded text-sm" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <input type="number" placeholder="Qty" className="w-full p-2 border rounded text-sm" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} min="1" />
                </div>
                <div className="col-span-2">
                  <input placeholder="Unit" className="w-full p-2 border rounded text-sm" value={line.unit_of_measure} onChange={e => updateLine(i, 'unit_of_measure', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <input type="number" placeholder="Price" className="w-full p-2 border rounded text-sm" value={line.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} min="0" step="0.01" />
                </div>
                <div className="col-span-2 flex gap-1">
                  <span className="text-xs text-gray-500 self-center">KSh {((Number(line.quantity) || 0) * (Number(line.unit_price) || 0)).toLocaleString()}</span>
                  {form.lines.length > 1 && <button type="button" className="text-red-500 text-lg ml-auto" onClick={() => removeLine(i)}>&times;</button>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50" type="button" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POCreateModal;
