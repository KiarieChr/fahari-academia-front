import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import { financeService } from '../../../../services/financeService';

const QuickAddCustomerModal = ({ show, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: 'Regular' // Default
    });

    const handleSubmit = async () => {
        if (!formData.name) return alert("Customer Name is required");

        setLoading(true);
        try {
            const newCustomer = await financeService.createCustomer(formData);
            onSave(newCustomer);
            onClose();
        } catch (error) {
            console.error("Failed to create customer", error);
            alert("Error: " + (error.response?.data?.detail || "Failed to create customer"));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-white border-bottom py-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                                <User size={20} className="text-primary" />
                            </div>
                            <h5 className="modal-title fw-bold text-dark mb-0">Quick Add Customer</h5>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Customer Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. John Doe, Acme Corp"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="+254..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Address</label>
                            <textarea
                                className="form-control"
                                rows="2"
                                placeholder="Physical Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="mb-2">
                            <label className="form-label small fw-bold text-muted">Type</label>
                            <select
                                className="form-select"
                                value={formData.customer_type}
                                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                            >
                                <option value="Regular">Regular Customer</option>
                                <option value="Student">Student</option>
                                <option value="Corporate">Corporate</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer border-top-0 pt-0 pb-4 px-4 bg-white">
                        <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Save size={16} className="me-2" />}
                            Save Customer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickAddCustomerModal;
