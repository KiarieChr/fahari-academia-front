import React, { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { incomeAccounts } from '../../fee-structure/data/mockFeeStructureData';
import { formatKES } from '../utils/invoiceUtils';
import { api } from '../../../../services/api';
import Swal from 'sweetalert2';

const ManualInvoiceModal = ({ show, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        studentId: '',
        term: '',
        year: '',
        dueDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const [structureId, setStructureId] = useState(null);
    const [contextLoading, setContextLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const [items, setItems] = useState([]);

    const handleSearchInput = async (val) => {
        setSearchTerm(val);
        if (val.length > 2) {
            try {
                const results = await api.get(`/api/fees/billing/search-students/?query=${val}`);
                setSearchResults(Array.isArray(results) ? results : []);
                setShowResults(true);
            } catch (err) {
                console.error("Search failed", err);
            }
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const selectStudent = (student) => {
        setSearchTerm(student.name);
        setFormData(prev => ({ ...prev, studentId: student.id }));
        setShowResults(false);
        fetchContext(student.id);
    };

    const fetchContext = async (studId) => {
        if (!studId) return;
        setContextLoading(true);
        try {
            const context = await api.get(`/api/fees/billing/context/?student_id=${studId}`);

            // Auto-populate context
            if (context.session) {
                setFormData(prev => ({
                    ...prev,
                    term: context.session.term_name,
                    year: context.session.year_name
                }));
            }

            if (context.structure) {
                setStructureId(context.structure.id);
                // Populate items
                setItems(context.fee_items.map(item => ({
                    id: item.id, // Keep FeeItem ID for backend mapping
                    name: item.name,
                    amount: item.amount,
                    accountId: item.account_id,
                    is_mandatory: item.is_mandatory
                })));
            } else {
                setStructureId(null);
                setItems([]);
            }

        } catch (error) {
            console.error("Failed to fetch billing context:", error);
            if (error.status === 404 || (error.response && error.response.status === 404)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Student Not Reported',
                    text: 'This student is not currently active. They need to be reported back to school (Admissions) for the current term before invoicing.',
                    confirmButtonColor: '#d33'
                });
                setStructureId(null);
                setItems([]);
            }
        } finally {
            setContextLoading(false);
        }
    };



    const handleItemChange = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const addItem = () => {
        setItems([...items, { id: `new-${Date.now()}`, name: '', amount: 0, accountId: '' }]);
    };

    const removeItem = (id) => {
        if (items.length > 0) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + Number(item.amount), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const invoicePayload = {
            student_id: formData.studentId,
            structure_id: structureId,
            term: formData.term, // Just for ref/validation if needed
            year: formData.year,
            due_date: formData.dueDate,
            remarks: formData.remarks,
            items: items.map(item => ({
                id: String(item.id).startsWith('new-') ? null : item.id, // Only send valid fee item IDs
                amount: Number(item.amount)
            }))
        };

        try {
            const newInvoice = await api.post('/api/fees/billing/invoices/', invoicePayload);

            // Toast Notification
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });

            Toast.fire({
                icon: 'success',
                title: 'Invoice Created Successfully'
            });

            onCreate(newInvoice); // Notify parent (refresh list)
            onClose();
        } catch (error) {
            console.error("Failed to create invoice:", error);

            // Toast Notification for Error
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000
            });

            Toast.fire({
                icon: 'error',
                title: 'Failed to create invoice',
                text: error.data?.detail || error.message || 'Unknown error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create Manual Invoice</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Student & Invoice Details */}
                            <div className="row g-3 mb-4">
                                {/* Student Search */}
                                <div className="col-md-6 position-relative">
                                    <label className="form-label">Student *</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><User size={18} /></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by name or admission..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearchInput(e.target.value)}
                                            disabled={submitting}
                                            required={!formData.studentId}
                                        />
                                        {formData.studentId && (
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFormData(prev => ({ ...prev, studentId: '' }));
                                                    setItems([]);
                                                }}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {showResults && searchResults.length > 0 && (
                                        <div className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                                            {searchResults.map(s => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    className="list-group-item list-group-item-action"
                                                    onClick={() => selectStudent(s)}
                                                >
                                                    <span className="fw-bold">{s.name}</span>
                                                    <small className="d-block text-muted">{s.admission_number}</small>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {contextLoading && <div className="form-text text-primary">Fetching details...</div>}
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Term</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.term || ''}
                                        readOnly
                                        placeholder="Auto-filled"
                                        style={{ backgroundColor: '#e9ecef' }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Year</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.year || ''}
                                        readOnly
                                        placeholder="Auto-filled"
                                        style={{ backgroundColor: '#e9ecef' }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Due Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        required
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Remarks</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Reason for invoice..."
                                        value={formData.remarks}
                                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <h6 className="fw-bold mb-3 border-bottom pb-2">Invoice Items</h6>
                            <div className="bg-light p-3 rounded mb-3">
                                {items.length === 0 && !contextLoading && (
                                    <p className="text-muted text-center small mb-0">No fee structure found for this student's active session.</p>
                                )}
                                {items.map((item, index) => (
                                    <div key={item.id} className="row g-2 align-items-center mb-2">
                                        <div className="col-md-8">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={item.name}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm text-end"
                                                value={item.amount}
                                                readOnly // Strictly from structure
                                                disabled
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex justify-content-end align-items-center">
                                <span className="me-3 fw-bold">Total Amount:</span>
                                <h4 className="mb-0 text-primary">{formatKES(calculateTotal())}</h4>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting || items.length === 0}>
                                {submitting ? 'Generating...' : 'Create Invoice'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManualInvoiceModal;
