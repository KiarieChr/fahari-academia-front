import React, { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
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
    const [templateId, setTemplateId] = useState(null);
    const [billingSource, setBillingSource] = useState(null);
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

            // Handle template-based billing
            if (context.billing_source === 'template' && context.template) {
                setBillingSource('template');
                setTemplateId(context.template.id);
                setStructureId(null);
                setItems(context.fee_items.map(item => ({
                    id: item.id,
                    name: item.name,
                    amount: item.amount,
                    accountId: item.account_id,
                    is_mandatory: item.is_mandatory
                })));
            } else if (context.structure) {
                setBillingSource('structure');
                setStructureId(context.structure.id);
                setTemplateId(null);
                setItems(context.fee_items.map(item => ({
                    id: item.id,
                    name: item.name,
                    amount: item.amount,
                    accountId: item.account_id,
                    is_mandatory: item.is_mandatory
                })));
            } else {
                setBillingSource(null);
                setStructureId(null);
                setTemplateId(null);
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
            billing_source: billingSource,
            structure_id: structureId,
            template_id: templateId,
            term: formData.term,
            year: formData.year,
            due_date: formData.dueDate,
            remarks: formData.remarks,
            items: items.map(item => ({
                id: String(item.id).startsWith('new-') ? null : item.id,
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
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="neo-card w-full max-w-3xl my-3">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h5 className="text-xl font-bold text-gray-700">Create Manual Invoice</h5>
                    <button type="button" className="text-gray-400 hover:text-rose-500 transition-colors" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Student & Invoice Details */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-2">
                            {/* Student Search */}
                            <div className="col-span-12 md:col-span-6 relative">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Student *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <User size={18} className="text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        className="neo-input w-full pr-3 font-bold"
                                        placeholder="Search by name or admission..."
                                        style={{paddingLeft:'30px'}}
                                        value={searchTerm}
                                        
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        disabled={submitting}
                                        required={!formData.studentId}
                                    />
                                    {formData.studentId && (
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500"
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
                                    <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {searchResults.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                                                onClick={() => selectStudent(s)}
                                            >
                                                <span className="block font-bold text-gray-700">{s.name}</span>
                                                <small className="block text-gray-400 font-bold">{s.admission_number}</small>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {contextLoading && <div className="text-xs font-bold text-indigo-500 mt-2">Fetching details...</div>}
                            </div>
                            <div className="col-span-12 md:col-span-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Term</label>
                                <input
                                    type="text"
                                    className="neo-input w-full font-bold bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                                    value={formData.term || ''}
                                    readOnly
                                    placeholder="Auto-filled"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Year</label>
                                <input
                                    type="text"
                                    className="neo-input w-full font-bold bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                                    value={formData.year || ''}
                                    readOnly
                                    placeholder="Auto-filled"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Due Date *</label>
                                <input
                                    type="date"
                                    className="neo-input w-full font-bold"
                                    required
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Remarks</label>
                                <input
                                    type="text"
                                    className="neo-input w-full font-bold"
                                    placeholder="Reason for invoice..."
                                    value={formData.remarks}
                                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <h6 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">Invoice Items</h6>
                        <div className="neo-pressed p-4 mb-6">
                            {items.length === 0 && !contextLoading && (
                                <p className="text-gray-400 font-bold text-center text-sm py-4">No fee structure found for this student's active session.</p>
                            )}
                            {items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center mb-3 last:mb-0">
                                    <div className="col-span-8">
                                        <input
                                            type="text"
                                            className="neo-input w-full font-bold bg-gray-50 text-gray-500 cursor-not-allowed opacity-70"
                                            value={item.name}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            className="neo-input w-full font-black text-right bg-gray-50 text-gray-500 cursor-not-allowed opacity-70"
                                            value={item.amount}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end items-center mb-4">
                            <span className="mr-4 text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount:</span>
                            <h4 className="text-2xl font-black text-indigo-600">{formatKES(calculateTotal())}</h4>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                        <button type="button" className="neo-btn px-4 py-2" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="neo-btn neo-btn-accent px-4 py-2" disabled={submitting || items.length === 0}>
                            {submitting ? 'Generating...' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualInvoiceModal;
