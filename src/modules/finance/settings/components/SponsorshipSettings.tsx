import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import { toast } from 'react-toastify';

const SponsorshipSettings = ({ accounts }) => {
    const [activeSubTab, setActiveSubTab] = useState('types'); // 'types' or 'sponsorships'
    const [sponsorTypes, setSponsorTypes] = useState([]);
    const [sponsorships, setSponsorships] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modals & Forms States
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [typeForm, setTypeForm] = useState({ name: '', clearing_account: '', description: '' });

    const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
    const [editingSponsorship, setEditingSponsorship] = useState(null);
    const [sponsorshipForm, setSponsorshipForm] = useState({
        name: '',
        sponsor_type: '',
        code: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        is_active: true
    });

    // Filter accounts to show only liability accounts
    const liabilityAccounts = accounts ? accounts.filter(acc => acc.type === 'LIABILITY') : [];

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [typesRes, sponsorshipsRes] = await Promise.all([
                financeService.getSponsorTypes(),
                financeService.getSponsorships()
            ]);
            setSponsorTypes(typesRes.results || typesRes || []);
            setSponsorships(sponsorshipsRes.results || sponsorshipsRes || []);
        } catch (error) {
            console.error('Failed to fetch sponsorship settings data:', error);
            toast.error('Failed to load settings data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Sponsor Type operations
    const handleSaveType = async () => {
        if (!typeForm.name || !typeForm.clearing_account) {
            toast.error('Name and Clearing GL Account are required');
            return;
        }

        try {
            if (editingType) {
                const res = await financeService.updateSponsorType(editingType.id, typeForm);
                setSponsorTypes(sponsorTypes.map(t => t.id === editingType.id ? res : t));
                toast.success('Sponsor Type updated successfully');
            } else {
                const res = await financeService.createSponsorType(typeForm);
                setSponsorTypes([...sponsorTypes, res]);
                toast.success('Sponsor Type created successfully');
            }
            setShowTypeModal(false);
            setEditingType(null);
            setTypeForm({ name: '', clearing_account: '', description: '' });
        } catch (error) {
            console.error('Failed to save sponsor type:', error);
            toast.error(error.response?.data?.detail || 'Error saving sponsor type');
        }
    };

    const handleEditType = (type) => {
        setEditingType(type);
        setTypeForm({
            name: type.name,
            clearing_account: type.clearing_account,
            description: type.description || ''
        });
        setShowTypeModal(true);
    };

    // Handle Sponsorship operations
    const handleSaveSponsorship = async () => {
        if (!sponsorshipForm.name || !sponsorshipForm.sponsor_type) {
            toast.error('Name and Sponsor Type classification are required');
            return;
        }

        try {
            if (editingSponsorship) {
                const res = await financeService.updateSponsorship(editingSponsorship.id, sponsorshipForm);
                setSponsorships(sponsorships.map(s => s.id === editingSponsorship.id ? res : s));
                toast.success('Sponsorship program updated successfully');
            } else {
                const res = await financeService.createSponsorship(sponsorshipForm);
                setSponsorships([...sponsorships, res]);
                toast.success('Sponsorship program created successfully');
            }
            setShowSponsorshipModal(false);
            setEditingSponsorship(null);
            setSponsorshipForm({
                name: '',
                sponsor_type: '',
                code: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                is_active: true
            });
        } catch (error) {
            console.error('Failed to save sponsorship:', error);
            toast.error(error.response?.data?.detail || 'Error saving sponsorship');
        }
    };

    const handleEditSponsorship = (sponsorship) => {
        setEditingSponsorship(sponsorship);
        setSponsorshipForm({
            name: sponsorship.name,
            sponsor_type: sponsorship.sponsor_type,
            code: sponsorship.code || '',
            contact_person: sponsorship.contact_person || '',
            email: sponsorship.email || '',
            phone: sponsorship.phone || '',
            address: sponsorship.address || '',
            is_active: sponsorship.is_active
        });
        setShowSponsorshipModal(true);
    };

    const handleToggleSponsorshipActive = async (sponsorship) => {
        try {
            const res = await financeService.updateSponsorship(sponsorship.id, {
                is_active: !sponsorship.is_active
            });
            setSponsorships(sponsorships.map(s => s.id === sponsorship.id ? res : s));
            toast.success(`Sponsorship program ${res.is_active ? 'activated' : 'deactivated'}`);
        } catch (error) {
            console.error('Failed to toggle status:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-3 px-4">
                {/* Tabs */}
                <ul className="nav nav-tabs card-header-tabs" role="tablist">
                    <li className="nav-item">
                        <button
                            className={`nav-link fw-semibold ${activeSubTab === 'types' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('types')}
                        >
                            Sponsor Classifications (Types)
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link fw-semibold ${activeSubTab === 'sponsorships' ? 'active' : ''}`}
                            onClick={() => setActiveSubTab('sponsorships')}
                        >
                            Sponsorship Programs (Sponsors)
                        </button>
                    </li>
                </ul>
            </div>
            
            <div className="card-body p-4">
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        <span className="ms-2 small text-muted">Loading settings...</span>
                    </div>
                ) : activeSubTab === 'types' ? (
                    <div>
                        {/* Sponsor Types Tab */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="fw-bold mb-1">Sponsor Classifications</h6>
                                <small className="text-muted">Classify your sponsors and link them to clearing GL liability accounts.</small>
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setEditingType(null);
                                    setTypeForm({ name: '', clearing_account: '', description: '' });
                                    setShowTypeModal(true);
                                }}
                            >
                                <Plus size={16} className="me-2" />
                                Add Sponsor Type
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Classification Name</th>
                                        <th>Clearing Liability Account</th>
                                        <th>Description</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sponsorTypes.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted small">
                                                No sponsor classifications configured. Click "Add Sponsor Type" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        sponsorTypes.map(type => (
                                            <tr key={type.id}>
                                                <td className="fw-semibold text-dark">{type.name}</td>
                                                <td>
                                                    <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">
                                                        {type.clearing_account_code} - {type.clearing_account_name}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">{type.description || '-'}</td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEditType(type)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Sponsorships Tab */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="fw-bold mb-1">Sponsorship Programs</h6>
                                <small className="text-muted">Specific sponsors (like Wings to Fly) that fund student fee receipts.</small>
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    setEditingSponsorship(null);
                                    setSponsorshipForm({
                                        name: '',
                                        sponsor_type: sponsorTypes[0]?.id || '',
                                        code: '',
                                        contact_person: '',
                                        email: '',
                                        phone: '',
                                        address: '',
                                        is_active: true
                                    });
                                    setShowSponsorshipModal(true);
                                }}
                                disabled={sponsorTypes.length === 0}
                            >
                                <Plus size={16} className="me-2" />
                                Add Sponsorship
                            </button>
                        </div>

                        {sponsorTypes.length === 0 && (
                            <div className="alert alert-warning d-flex align-items-center mb-3">
                                <ShieldAlert size={18} className="me-2" />
                                <span>Please configure at least one Sponsor Classification before creating Sponsorships.</span>
                            </div>
                        )}

                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Sponsor Name</th>
                                        <th>Code</th>
                                        <th>Classification</th>
                                        <th>Contact Person</th>
                                        <th>Contact details</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sponsorships.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted small">
                                                No sponsorship programs configured. Click "Add Sponsorship" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        sponsorships.map(s => (
                                            <tr key={s.id}>
                                                <td className="fw-semibold text-dark">{s.name}</td>
                                                <td><span className="badge bg-secondary">{s.code || '-'}</span></td>
                                                <td>
                                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                                                        {s.sponsor_type_name}
                                                    </span>
                                                </td>
                                                <td className="small">{s.contact_person || '-'}</td>
                                                <td className="small text-muted">
                                                    {s.email && <div>{s.email}</div>}
                                                    {s.phone && <div>{s.phone}</div>}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className={`btn btn-sm ${s.is_active ? 'btn-success' : 'btn-secondary'}`}
                                                        onClick={() => handleToggleSponsorshipActive(s)}
                                                    >
                                                        {s.is_active ? <Check size={14} /> : <X size={14} />}
                                                    </button>
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEditSponsorship(s)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Sponsor Type Modal */}
            {showTypeModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingType ? 'Edit Sponsor Type' : 'Add Sponsor Type'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowTypeModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Classification Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={typeForm.name}
                                        onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                        placeholder="e.g., NGO Scholarships"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Clearing GL Liability Account *</label>
                                    <select
                                        className="form-select"
                                        value={typeForm.clearing_account}
                                        onChange={(e) => setTypeForm({ ...typeForm, clearing_account: e.target.value })}
                                    >
                                        <option value="">Select Liability Account...</option>
                                        {liabilityAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </select>
                                    <div className="form-text small text-muted">
                                        Used in clearing the sponsorship receipts during allocations to students.
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={typeForm.description}
                                        onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                                        placeholder="Brief description of this classification..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveType}>Save Classification</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sponsorship Modal */}
            {showSponsorshipModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingSponsorship ? 'Edit Sponsorship' : 'Add Sponsorship'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSponsorshipModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Sponsor/Program Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={sponsorshipForm.name}
                                            onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, name: e.target.value })}
                                            placeholder="e.g. Equity Group Foundation Wings to Fly"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Sponsor Type (Classification) *</label>
                                        <select
                                            className="form-select"
                                            value={sponsorshipForm.sponsor_type}
                                            onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, sponsor_type: e.target.value })}
                                        >
                                            <option value="">Select Sponsor Type...</option>
                                            {sponsorTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Unique Sponsor Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={sponsorshipForm.code}
                                            onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, code: e.target.value })}
                                            placeholder="e.g. WTF-EQ"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Contact Person</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={sponsorshipForm.contact_person}
                                            onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, contact_person: e.target.value })}
                                            placeholder="Contact name"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Contact Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={sponsorshipForm.email}
                                            onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, email: e.target.value })}
                                            placeholder="email@sponsor.org"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Contact Phone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={sponsorshipForm.phone}
                                            onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, phone: e.target.value })}
                                            placeholder="Phone number"
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Address / Remarks</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={sponsorshipForm.address}
                                            onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, address: e.target.value })}
                                            placeholder="Physical address or remarks..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowSponsorshipModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveSponsorship}>Save Sponsorship</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SponsorshipSettings;
