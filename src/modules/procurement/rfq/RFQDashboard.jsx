import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, RefreshCcw, Send, Eye, Award, X, Copy, ExternalLink } from 'lucide-react';
import procurementApi from '../../../services/procurementApiService';
import { toast } from 'react-toastify';

const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    CLOSED: 'bg-yellow-100 text-yellow-800',
    AWARDED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

const RFQDashboard = () => {
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list, create, detail, quotations
    const [selected, setSelected] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const fetchRFQs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await procurementApi.rfqs.list();
            setRfqs(res.results || res || []);
        } catch {
            toast.error('Failed to load RFQs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRFQs(); }, [fetchRFQs]);

    const loadSuppliers = async () => {
        if (suppliers.length) return;
        try {
            const { default: api } = await import('../../../services/api');
            const res = await api.get('/api/payables/suppliers/');
            setSuppliers(res.results || res || []);
        } catch { /* ignore */ }
    };

    const handleCreate = async (data) => {
        try {
            await procurementApi.rfqs.create(data);
            toast.success('RFQ created');
            setView('list');
            fetchRFQs();
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to create RFQ');
        }
    };

    const handleSend = async (id) => {
        try {
            await procurementApi.rfqs.sendToSuppliers(id);
            toast.success('RFQ sent to suppliers');
            fetchRFQs();
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to send RFQ');
        }
    };

    const handleViewQuotations = async (rfq) => {
        setSelected(rfq);
        try {
            const res = await procurementApi.rfqs.getQuotations(rfq.id);
            setQuotations(res.results || res || []);
            setView('quotations');
        } catch {
            toast.error('Failed to load quotations');
        }
    };

    const handleAward = async (quotationId) => {
        if (!selected) return;
        try {
            await procurementApi.rfqs.award(selected.id, quotationId, true);
            toast.success('Quotation awarded and PO created');
            setView('list');
            fetchRFQs();
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to award');
        }
    };

    const handleAddSupplier = async (rfqId, supplierId) => {
        try {
            await procurementApi.rfqs.addSupplier(rfqId, supplierId);
            toast.success('Supplier added');
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to add supplier');
        }
    };

    return (
        <DashboardLayout title="Request for Quotations">
            <div className="dashboard-main-content">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">RFQ Management</h2>
                        <p className="text-sm text-gray-500">Create and manage requests for quotations from suppliers</p>
                    </div>
                    <div className="flex gap-2">
                        {view !== 'list' && (
                            <button onClick={() => { setView('list'); setSelected(null); }} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                                Back to List
                            </button>
                        )}
                        {view === 'list' && (
                            <>
                                <button onClick={fetchRFQs} className="p-2 border rounded-lg hover:bg-gray-50">
                                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                                </button>
                                <button onClick={() => { loadSuppliers(); setView('create'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <Plus size={18} /> New RFQ
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* List View */}
                {view === 'list' && (
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-4 font-semibold">RFQ Number</th>
                                        <th className="p-4 font-semibold">Title</th>
                                        <th className="p-4 font-semibold">Deadline</th>
                                        <th className="p-4 font-semibold">Suppliers</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading...</td></tr>
                                    ) : rfqs.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">No RFQs found</td></tr>
                                    ) : rfqs.map(rfq => (
                                        <tr key={rfq.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-blue-600">{rfq.rfq_number}</td>
                                            <td className="p-4">{rfq.title}</td>
                                            <td className="p-4 text-gray-500">{rfq.deadline}</td>
                                            <td className="p-4">{rfq.invitations_count || rfq.invitations?.length || 0}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[rfq.status] || 'bg-gray-100'}`}>
                                                    {rfq.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleViewQuotations(rfq)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Quotations">
                                                        <Eye size={16} />
                                                    </button>
                                                    {rfq.status === 'DRAFT' && (
                                                        <button onClick={() => handleSend(rfq.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Send to Suppliers">
                                                            <Send size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create View */}
                {view === 'create' && (
                    <RFQCreateForm suppliers={suppliers} onSubmit={handleCreate} onCancel={() => setView('list')} onAddSupplier={handleAddSupplier} />
                )}

                {/* Quotations Comparison View */}
                {view === 'quotations' && selected && (
                    <QuotationComparison rfq={selected} quotations={quotations} onAward={handleAward} />
                )}
            </div>
        </DashboardLayout>
    );
};

// ─── RFQ Create Form ────────────────────────────────────────────────────────
const RFQCreateForm = ({ suppliers, onSubmit, onCancel }) => {
    const [form, setForm] = useState({
        title: '', description: '', deadline: '', terms_and_conditions: '',
        supplier_ids: [],
        lines: [{ description: '', quantity: 1, unit_of_measure: 'Pcs', specification: '' }],
    });

    const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { description: '', quantity: 1, unit_of_measure: 'Pcs', specification: '' }] }));
    const removeLine = (i) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
    const updateLine = (i, field, val) => {
        setForm(f => {
            const lines = [...f.lines];
            lines[i] = { ...lines[i], [field]: val };
            return { ...f, lines };
        });
    };

    const toggleSupplier = (id) => {
        setForm(f => ({
            ...f,
            supplier_ids: f.supplier_ids.includes(id)
                ? f.supplier_ids.filter(s => s !== id)
                : [...f.supplier_ids, id],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title) return toast.error('Title is required');
        if (!form.deadline) return toast.error('Deadline is required');
        if (!form.supplier_ids.length) return toast.error('Select at least one supplier');
        onSubmit(form);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold mb-4">New Request for Quotation</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input className="w-full p-2 border rounded-lg" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Deadline *</label>
                        <input type="datetime-local" className="w-full p-2 border rounded-lg" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea className="w-full p-2 border rounded-lg" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                    <textarea className="w-full p-2 border rounded-lg" rows={2} value={form.terms_and_conditions} onChange={e => setForm({ ...form, terms_and_conditions: e.target.value })} />
                </div>

                {/* Supplier Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Select Suppliers *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                        {suppliers.map(s => (
                            <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input type="checkbox" checked={form.supplier_ids.includes(s.id)} onChange={() => toggleSupplier(s.id)} className="rounded" />
                                {s.name}
                            </label>
                        ))}
                        {!suppliers.length && <p className="text-gray-400 col-span-3">No suppliers found</p>}
                    </div>
                </div>

                {/* Lines */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Items / Requirements</label>
                        <button type="button" className="text-sm text-blue-600 hover:underline" onClick={addLine}>+ Add Item</button>
                    </div>
                    {form.lines.map((line, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                            <div className="col-span-5">
                                <input placeholder="Description" className="w-full p-2 border rounded text-sm" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <input type="number" placeholder="Qty" className="w-full p-2 border rounded text-sm" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} min="1" />
                            </div>
                            <div className="col-span-2">
                                <input placeholder="Unit" className="w-full p-2 border rounded text-sm" value={line.unit_of_measure} onChange={e => updateLine(i, 'unit_of_measure', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <input placeholder="Spec" className="w-full p-2 border rounded text-sm" value={line.specification} onChange={e => updateLine(i, 'specification', e.target.value)} />
                            </div>
                            <div className="col-span-1">
                                {form.lines.length > 1 && <button type="button" className="text-red-500 text-lg" onClick={() => removeLine(i)}>&times;</button>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create RFQ</button>
                </div>
            </form>
        </div>
    );
};

// ─── Quotation Comparison ───────────────────────────────────────────────────
const QuotationComparison = ({ rfq, quotations, onAward }) => {
    const copyPublicLink = (inv) => {
        const url = `${window.location.origin}/quote/${inv.token}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold mb-1">{rfq.title}</h3>
                <p className="text-sm text-gray-500 mb-4">RFQ: {rfq.rfq_number} | Deadline: {rfq.deadline} | Status: {rfq.status}</p>

                {/* Supplier Invitations */}
                {rfq.invitations?.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Supplier Links</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {rfq.invitations.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border text-sm">
                                    <span className="font-medium">{inv.supplier_name || `Supplier #${inv.supplier}`}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={inv.viewed_at ? 'text-green-600' : 'text-gray-400'}>{inv.viewed_at ? 'Viewed' : 'Not viewed'}</span>
                                        <button onClick={() => copyPublicLink(inv)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Copy Public Link">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quotation Comparison Table */}
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Received Quotations ({quotations.length})</h4>
                {quotations.length === 0 ? (
                    <p className="text-gray-400 text-sm p-4 text-center border rounded-lg">No quotations received yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 font-semibold">Supplier</th>
                                    <th className="p-3 font-semibold">Reference</th>
                                    <th className="p-3 font-semibold">Total Amount</th>
                                    <th className="p-3 font-semibold">Delivery Period</th>
                                    <th className="p-3 font-semibold">Validity (days)</th>
                                    <th className="p-3 font-semibold">Status</th>
                                    <th className="p-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {quotations.map(q => (
                                    <tr key={q.id} className={`hover:bg-gray-50 ${q.status === 'SELECTED' ? 'bg-green-50' : ''}`}>
                                        <td className="p-3 font-medium">{q.supplier_name || q.supplier}</td>
                                        <td className="p-3">{q.quotation_reference || '-'}</td>
                                        <td className="p-3 font-bold">KSh {Number(q.total_amount).toLocaleString()}</td>
                                        <td className="p-3">{q.delivery_period || '-'}</td>
                                        <td className="p-3">{q.validity_days}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                q.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                                                q.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>{q.status}</span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {q.status === 'SUBMITTED' && rfq.status === 'CLOSED' && (
                                                <button onClick={() => onAward(q.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1 ml-auto">
                                                    <Award size={14} /> Award
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RFQDashboard;
