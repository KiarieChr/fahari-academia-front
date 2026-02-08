import React, {useState} from 'react';

const POCreateModal = ({onClose = () => {}, onCreated = () => {}}) => {
  const [form, setForm] = useState({supplierId: '', poDate: new Date().toISOString().slice(0,10), expectedDelivery: '', items: []});

  const submit = (e) => {
    e.preventDefault();
    // For now we call onCreated to refresh list; actual creation should call service
    onCreated();
  };

  return (
    <div className="po-modal modal-backdrop">
      <div className="po-modal-dialog card">
        <div className="card-header d-flex justify-content-between">
          <h5>Create Purchase Order</h5>
          <button className="btn btn-sm btn-light" onClick={onClose}>Close</button>
        </div>
        <form className="card-body" onSubmit={submit}>
          <div className="mb-2">
            <label className="form-label">Supplier</label>
            <select className="form-select" value={form.supplierId} onChange={e => setForm({...form, supplierId: e.target.value})}>
              <option value="">Select supplier</option>
              <option value="supplier-1">Supplier A</option>
              <option value="supplier-2">Supplier B</option>
            </select>
          </div>
          <div className="row">
            <div className="col">
              <label className="form-label">PO Date</label>
              <input type="date" className="form-control" value={form.poDate} onChange={e=>setForm({...form, poDate: e.target.value})} />
            </div>
            <div className="col">
              <label className="form-label">Expected Delivery</label>
              <input type="date" className="form-control" value={form.expectedDelivery} onChange={e=>setForm({...form, expectedDelivery: e.target.value})} />
            </div>
          </div>
          <div className="mt-3 text-end">
            <button className="btn btn-secondary me-2" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" type="submit">Create PO</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POCreateModal;
