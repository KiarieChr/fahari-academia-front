import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

const sampleTerms = [
  { id: 1, year: '2025/2026', name: 'Term 1', code: '2025T1', start: '2025-08-01', end: '2025-10-31', status: 'Active', current: true },
  { id: 2, year: '2025/2026', name: 'Term 2', code: '2025T2', start: '2025-11-01', end: '2026-01-31', status: 'Inactive', current: false },
];

const TermSetupCard = () => {
  const [terms, setTerms] = useState(sampleTerms);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ year: '', name: '', start: '', end: '', current: false });

  const reset = () => {
    setEditing(null);
    setForm({ year: '', name: '', start: '', end: '', current: false });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // basic validation
    if (!form.year || !form.name || !form.start || !form.end) return;

    if (editing) {
      setTerms((s) => s.map((t) => (t.id === editing.id ? { ...t, ...form, code: `${form.year.replace('/', '')}${form.name.replace(/\s+/g, '')}` } : t)));
    } else {
      const id = Date.now();
      setTerms((s) => [...s, { id, ...form, code: `${form.year.replace('/', '')}${form.name.replace(/\s+/g, '')}` }]);
    }
    reset();
    setOpen(false);
  };

  const handleEdit = (t) => {
    setEditing(t);
    setForm({ year: t.year, name: t.name, start: t.start, end: t.end, current: t.current });
    setOpen(true);
  };

  const handleDelete = (id) => {
    // soft-delete suggestion: here we remove for demo
    setTerms((s) => s.filter((t) => t.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Academic Terms</h3>
          <button onClick={() => { reset(); setOpen(true); }} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold">
            <Plus size={14} /> New Term
          </button>
        </div>

        <div className="space-y-3">
          {terms.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{t.name} — {t.year}</h4>
                  {t.current && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">Current</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.start} → {t.end} • Code: <span className="font-mono text-gray-700">{t.code}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(t)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><Edit size={14} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Rules & Actions</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Only one active/current term at a time.</li>
          <li>• End date must be after start date.</li>
          <li>• Terms in use cannot be deleted (soft-delete recommended).</li>
        </ul>
      </div>

      {/* Modal */}
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={editing ? 'Edit Term' : 'Create Term'}
          size="lg"
          footer={
            <>
              <Modal.CancelButton onClick={() => { setOpen(false); reset(); }} />
              <Modal.SubmitButton form="termSetupCardForm">Save Term</Modal.SubmitButton>
            </>
          }
        >
          <form id="termSetupCardForm" className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Academic Year</label>
                <input value={form.year} onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))} className={inputClass} placeholder="2025/2026" />
              </div>
              <div>
                <label className={labelClass}>Term Name</label>
                <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className={inputClass} placeholder="Term 1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={form.start} onChange={(e) => setForm((s) => ({ ...s, start: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={form.end} onChange={(e) => setForm((s) => ({ ...s, end: e.target.value }))} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input id="current" type="checkbox" checked={form.current} onChange={(e) => setForm((s) => ({ ...s, current: e.target.checked }))} className="h-4 w-4" />
              <label htmlFor="current" className="text-sm text-black">Set as current term (auto-deactivates previous)</label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TermSetupCard;
