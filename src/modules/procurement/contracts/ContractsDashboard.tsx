import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, RefreshCcw, FileText, Calendar, AlertTriangle, CheckCircle, X, Upload } from 'lucide-react';
import procurementApi from '../../../services/procurementApiService';
import { toast } from 'react-toastify';

const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    TERMINATED: 'bg-red-100 text-red-800',
    RENEWED: 'bg-blue-100 text-blue-800',
};

const ContractsDashboard = ({ noLayout = false }) => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list, create, detail
    const [selected, setSelected] = useState(null);
    const [stats, setStats] = useState({});
    const [expiring, setExpiring] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [milestones, setMilestones] = useState([]);

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        try {
            const [listRes, statsRes, expiringRes] = await Promise.all([
                procurementApi.contracts.list(),
                procurementApi.contracts.stats().catch(() => ({})),
                procurementApi.contracts.expiringSoon().catch(() => []),
            ]);
            setContracts(listRes.results || listRes || []);
            setStats(statsRes);
            setExpiring(expiringRes.results || expiringRes || []);
        } catch {
            toast.error('Failed to load contracts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchContracts(); }, [fetchContracts]);

    const loadSuppliers = async () => {
        if (suppliers.length) return;
        try {
            const token = localStorage.getItem('academia-token');
            const res = await fetch('/api/payables/suppliers/?page_size=500', {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Token ${token}` } : {}),
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setSuppliers(data.results || data || []);
        } catch (err) {
            console.error('Failed to load suppliers:', err);
            toast.error('Could not load suppliers. Please refresh and try again.');
        }
    };

    const handleCreate = async (data) => {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([k, v]) => {
                if (v !== null && v !== undefined && k !== 'document' && k !== 'milestones') {
                    formData.append(k, v);
                }
            });
            if (data.document) formData.append('document', data.document);
            if (data.milestones?.length) formData.append('milestones', JSON.stringify(data.milestones));
            await procurementApi.contracts.create(formData);
            toast.success('Contract created');
            setView('list');
            fetchContracts();
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to create contract');
        }
    };

    const handleViewDetail = async (contract) => {
        setSelected(contract);
        try {
            const ms = await procurementApi.contracts.getMilestones(contract.id);
            setMilestones(ms.results || ms || []);
        } catch { setMilestones([]); }
        setView('detail');
    };

    const handleActivate = async (id) => {
        try {
            await procurementApi.contracts.activate(id);
            toast.success('Contract activated');
            fetchContracts();
            if (selected?.id === id) setSelected({ ...selected, status: 'ACTIVE' });
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to activate');
        }
    };

    const handleTerminate = async (id) => {
        try {
            await procurementApi.contracts.terminate(id);
            toast.success('Contract terminated');
            fetchContracts();
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to terminate');
        }
    };

    const handleCompleteMilestone = async (contractId, milestoneId) => {
        try {
            await procurementApi.contracts.completeMilestone(contractId, milestoneId);
            toast.success('Milestone completed');
            const ms = await procurementApi.contracts.getMilestones(contractId);
            setMilestones(ms.results || ms || []);
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed');
        }
    };

    const content = (
            <div className="dashboard-main-content">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Contract Management</h2>
                        <p className="text-sm text-gray-500">Manage supplier contracts, milestones, and renewals</p>
                    </div>
                    <div className="flex gap-2">
                        {view !== 'list' && (
                            <button onClick={() => { setView('list'); setSelected(null); }} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Back to List</button>
                        )}
                        {view === 'list' && (
                            <>
                                <button onClick={fetchContracts} className="p-2 border rounded-lg hover:bg-gray-50" style={{borderRadius:'10px'}}>
                                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                                </button>
                                <button onClick={() => { loadSuppliers(); setView('create'); }} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                                    style={{borderRadius:'10px'}}>
                                    <Plus size={18} /> New Contract
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                {view === 'list' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-4">
                        <StatCard title="Total Contracts" value={stats.total || contracts.length} icon={FileText} color="bg-blue-500" />
                        <StatCard title="Active" value={stats.active || 0} icon={CheckCircle} color="bg-green-500" />
                        <StatCard title="Expiring Soon" value={expiring.length} icon={AlertTriangle} color="bg-orange-500" />
                        <StatCard title="Total Value" value={`KSh ${(stats.total_value || 0).toLocaleString()}`} icon={Calendar} color="bg-indigo-500" />
                    </div>
                )}

                {/* Expiring Alert */}
                {view === 'list' && expiring.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} /> Contracts Expiring Soon
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {expiring.map(c => (
                                <div key={c.id} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                                    <span className="font-medium">{c.title} — {c.supplier_name}</span>
                                    <span className="text-orange-600">{c.days_remaining} days left</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-4 font-semibold">Contract #</th>
                                        <th className="p-4 font-semibold">Title</th>
                                        <th className="p-4 font-semibold">Supplier</th>
                                        <th className="p-4 font-semibold">Type</th>
                                        <th className="p-4 font-semibold">Period</th>
                                        <th className="p-4 font-semibold">Value</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {loading ? (
                                        <tr><td colSpan="8" className="p-8 text-center text-gray-400">Loading...</td></tr>
                                    ) : contracts.length === 0 ? (
                                        <tr><td colSpan="8" className="p-8 text-center text-gray-400">No contracts found</td></tr>
                                    ) : contracts.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-blue-600">{c.contract_number}</td>
                                            <td className="p-4">{c.title}</td>
                                            <td className="p-4">{c.supplier_name}</td>
                                            <td className="p-4 text-gray-500">{c.contract_type?.replace('_', ' ')}</td>
                                            <td className="p-4 text-gray-500 text-xs">{c.start_date} — {c.end_date}</td>
                                            <td className="p-4 font-bold">KSh {Number(c.contract_value).toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || 'bg-gray-100'}`}>{c.status}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleViewDetail(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                                                        <FileText size={16} />
                                                    </button>
                                                    {c.status === 'DRAFT' && (
                                                        <button onClick={() => handleActivate(c.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Activate">
                                                            <CheckCircle size={16} />
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
                    <ContractCreateForm suppliers={suppliers} onSubmit={handleCreate} onCancel={() => setView('list')} />
                )}

                {/* Detail View */}
                {view === 'detail' && selected && (
                    <ContractDetail
                        contract={selected}
                        milestones={milestones}
                        onActivate={handleActivate}
                        onTerminate={handleTerminate}
                        onCompleteMilestone={handleCompleteMilestone}
                    />
                )}
            </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Supplier Contracts">
            {content}
        </DashboardLayout>
    );
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="relative backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-sm  flex items-center justify-between">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none">
            <div className='relative z-10 p-3'>
                <p className="relative text-sm text-gray-500 font-medium mb-1 tracking-wider pl-2 px-1" style= {{left:'5rem'}} >{title}</p>
                <h3 className="relative text-2xl font-bold text-gray-800" style={{left:'5rem'}}>{value}</h3>
            </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

// ─── Contract Create Form ───────────────────────────────────────────────────
const ContractCreateForm = ({ suppliers, onSubmit, onCancel }) => {
    const [form, setForm] = useState({
        title: '', supplier: '', contract_type: 'FIXED_PRICE',
        start_date: '', end_date: '', contract_value: '',
        description: '', terms_and_conditions: '',
        renewal_reminder_days: 30, document: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.supplier || !form.start_date || !form.end_date) {
            return toast.error('Fill all required fields');
        }
        onSubmit(form);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold mb-4">New Supplier Contract</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title *</label>
                        <input className="w-full p-2 border rounded-lg" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Supplier *</label>
                        <select className="w-full p-2 border rounded-lg" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} required>
                            <option value="">Select supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contract Type</label>
                        <select className="w-full p-2 border rounded-lg" value={form.contract_type} onChange={e => setForm({ ...form, contract_type: e.target.value })}>
                            <option value="FIXED_PRICE">Fixed Price</option>
                            <option value="FRAMEWORK">Framework</option>
                            <option value="BLANKET">Blanket</option>
                            <option value="SERVICE">Service</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contract Value (KSh)</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date *</label>
                        <input type="date" className="w-full p-2 border rounded-lg" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date *</label>
                        <input type="date" className="w-full p-2 border rounded-lg" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
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
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Renewal Reminder (days)</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={form.renewal_reminder_days} onChange={e => setForm({ ...form, renewal_reminder_days: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contract Document</label>
                        <input type="file" className="w-full p-2 border rounded-lg" onChange={e => setForm({ ...form, document: e.target.files[0] })} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Contract</button>
                </div>
            </form>
        </div>
    );
};

// ─── Contract Detail ────────────────────────────────────────────────────────
const ContractDetail = ({ contract, milestones, onActivate, onTerminate, onCompleteMilestone }) => (
    <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">{contract.title}</h3>
                    <p className="text-sm text-gray-500">{contract.contract_number} | {contract.supplier_name}</p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[contract.status] || 'bg-gray-100'}`}>{contract.status}</span>
                    {contract.status === 'DRAFT' && (
                        <button onClick={() => onActivate(contract.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Activate</button>
                    )}
                    {contract.status === 'ACTIVE' && (
                        <button onClick={() => onTerminate(contract.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Terminate</button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg mb-4">
                <div><span className="text-gray-500">Type:</span> <span className="font-medium">{contract.contract_type?.replace('_', ' ')}</span></div>
                <div><span className="text-gray-500">Value:</span> <span className="font-bold">KSh {Number(contract.contract_value).toLocaleString()}</span></div>
                <div><span className="text-gray-500">Start:</span> <span className="font-medium">{contract.start_date}</span></div>
                <div><span className="text-gray-500">End:</span> <span className="font-medium">{contract.end_date}</span></div>
            </div>

            {contract.description && <p className="text-sm text-gray-600 mb-4">{contract.description}</p>}
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Milestones ({milestones.length})</h4>
            {milestones.length === 0 ? (
                <p className="text-gray-400 text-sm">No milestones defined</p>
            ) : (
                <div className="space-y-2">
                    {milestones.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <span className={`font-medium ${m.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>{m.title}</span>
                                <span className="text-xs text-gray-500 ml-2">Due: {m.due_date} | KSh {Number(m.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    m.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    m.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>{m.status}</span>
                                {m.status !== 'COMPLETED' && (
                                    <button onClick={() => onCompleteMilestone(contract.id, m.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Mark Complete">
                                        <CheckCircle size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default ContractsDashboard;
