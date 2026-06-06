/**
 * Supplier Management Modal
 * 
 * Manages suppliers with KRA PIN validation and AP account linking.
 * Supports CRUD operations for suppliers.
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Search, Building2, Mail, Phone, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { financeService } from '../../../../services/financeService';

const SupplierManagementModal = ({ show, onClose, onSupplierCreated }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        kra_pin: '',
        vat_registered: false,
        email: '',
        phone: '',
        address: '',
        bank_name: '',
        account_number: '',
        bank_branch: '',
        payment_terms: 'NET_30',
        contact_person: '',
        notes: ''
    });

    // KRA PIN validation
    const [kraValid, setKraValid] = useState(null);

    useEffect(() => {
        if (show) {
            loadData();
        }
    }, [show]);

    const loadData = async () => {
        setLoading(true);
        try {
            const suppliersRes = await financeService.getSuppliers().catch(() => null);
            setSuppliers(suppliersRes?.results || suppliersRes || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const validateKRAPin = (pin) => {
        // KRA PIN format: A000000000A (1 letter + 9 digits + 1 letter)
        const kraPattern = /^[A-Z]\d{9}[A-Z]$/;
        return kraPattern.test(pin.toUpperCase());
    };

    const handleKRAPinChange = (value) => {
        const upperValue = value.toUpperCase();
        setFormData(prev => ({ ...prev, kra_pin: upperValue }));

        if (upperValue.length === 11) {
            setKraValid(validateKRAPin(upperValue));
        } else {
            setKraValid(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            kra_pin: '',
            vat_registered: false,
            email: '',
            phone: '',
            address: '',
            bank_name: '',
            account_number: '',
            bank_branch: '',
            payment_terms: 'NET_30',
            contact_person: '',
            notes: ''
        });
        setKraValid(null);
        setEditingSupplier(null);
        setShowForm(false);
    };

    const handleEdit = (supplier) => {
        setFormData({
            name: supplier.name || '',
            kra_pin: supplier.kra_pin || '',
            vat_registered: supplier.vat_registered || false,
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            bank_name: supplier.bank_name || '',
            account_number: supplier.account_number || '',
            bank_branch: supplier.bank_branch || '',
            payment_terms: supplier.payment_terms || 'NET_30',
            contact_person: supplier.contact_person || '',
            notes: supplier.notes || ''
        });
        setKraValid(supplier.kra_pin ? validateKRAPin(supplier.kra_pin) : null);
        setEditingSupplier(supplier);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            // Validate KRA PIN
            if (formData.kra_pin && !validateKRAPin(formData.kra_pin)) {
                throw new Error('Invalid KRA PIN format. Expected: A000000000A');
            }

            let response;
            if (editingSupplier) {
                response = await financeService.updateSupplier(editingSupplier.id, formData);
                setSuppliers(prev => prev.map(s =>
                    s.id === editingSupplier.id ? response : s
                ));
            } else {
                response = await financeService.createSupplier(formData);
                setSuppliers(prev => [...prev, response]);
            }

            if (onSupplierCreated) {
                onSupplierCreated(response);
            }

            resetForm();
        } catch (err) {
            console.error('Failed to save supplier:', err);
            setError(err.response?.data?.error || err.message || 'Failed to save supplier');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (supplier) => {
        if (!window.confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
            return;
        }

        try {
            await financeService.deleteSupplier(supplier.id);
            setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
        } catch (err) {
            console.error('Failed to delete supplier:', err);
            setError('Failed to delete supplier');
        }
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.kra_pin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!show) return null;

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header">
                    <div className="d-flex align-items-center gap-2">
                        <Building2 size={20} />
                        <h5 className="mb-0">Supplier Management</h5>
                    </div>
                    <button className="btn-close" onClick={onClose}></button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger m-3 mb-0 d-flex align-items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                        <button className="btn-close ms-auto" onClick={() => setError(null)}></button>
                    </div>
                )}

                <div className="modal-body" style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
                    {!showForm ? (
                        <>
                            {/* Toolbar */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="input-group" style={{ maxWidth: '300px' }}>
                                    <span className="input-group-text bg-white">
                                        <Search size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search suppliers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={() => setShowForm(true)}
                                >
                                    <Plus size={16} />
                                    Add Supplier
                                </button>
                            </div>

                            {/* Suppliers Table */}
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Code</th>
                                                <th>Name</th>
                                                <th>KRA PIN</th>
                                                <th>VAT Reg.</th>
                                                <th>Payment Terms</th>
                                                <th>Contact</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSuppliers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4 text-muted">
                                                        No suppliers found
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredSuppliers.map(supplier => (
                                                    <tr key={supplier.id}>
                                                        <td><code>{supplier.code}</code></td>
                                                        <td>
                                                            <div className="fw-medium">{supplier.name}</div>
                                                            {supplier.email && (
                                                                <small className="text-muted">{supplier.email}</small>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className="font-monospace">
                                                                {supplier.kra_pin || '-'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {supplier.vat_registered ? (
                                                                <span className="badge bg-success-subtle text-success">Yes</span>
                                                            ) : (
                                                                <span className="badge bg-secondary-subtle text-secondary">No</span>
                                                            )}
                                                        </td>
                                                        <td>{supplier.payment_terms} days</td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-1">
                                                                {supplier.phone && (
                                                                    <small className="d-flex align-items-center gap-1">
                                                                        <Phone size={12} /> {supplier.phone}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleEdit(supplier)}
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDelete(supplier)}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Supplier Form */
                        <form onSubmit={handleSubmit}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="mb-0">
                                    {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
                                </h6>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="row g-3">
                                {/* Basic Info */}
                                <div className="col-12">
                                    <h6 className="text-muted border-bottom pb-2 mb-3">
                                        Basic Information
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Supplier Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        KRA PIN
                                        {kraValid !== null && (
                                            kraValid ? (
                                                <CheckCircle2 size={14} className="ms-2 text-success" />
                                            ) : (
                                                <AlertCircle size={14} className="ms-2 text-danger" />
                                            )
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control font-monospace ${kraValid === false ? 'is-invalid' : kraValid === true ? 'is-valid' : ''
                                            }`}
                                        name="kra_pin"
                                        value={formData.kra_pin}
                                        onChange={(e) => handleKRAPinChange(e.target.value)}
                                        placeholder="A000000000A"
                                        maxLength={11}
                                    />
                                    <div className="form-text">Format: A000000000A</div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Mail size={14} />
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Phone</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Phone size={14} />
                                        </span>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Contact Person</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <div className="form-check mt-4">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="vat_registered"
                                            name="vat_registered"
                                            checked={formData.vat_registered}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="vat_registered">
                                            VAT Registered
                                        </label>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        rows="2"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Bank Details */}
                                <div className="col-12 mt-4">
                                    <h6 className="text-muted border-bottom pb-2 mb-3">
                                        <CreditCard size={16} className="me-2" />
                                        Bank Details
                                    </h6>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Bank Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="bank_name"
                                        value={formData.bank_name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Account Number</label>
                                    <input
                                        type="text"
                                        className="form-control font-monospace"
                                        name="account_number"
                                        value={formData.account_number}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Branch</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="bank_branch"
                                        value={formData.bank_branch}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Payment Settings */}
                                <div className="col-12 mt-4">
                                    <h6 className="text-muted border-bottom pb-2 mb-3">
                                        Payment Settings
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Payment Terms (Days)</label>
                                    <select
                                        className="form-select"
                                        name="payment_terms"
                                        value={formData.payment_terms}
                                        onChange={handleInputChange}
                                    >
                                        <option value="CASH">Cash on Delivery</option>
                                        <option value="NET_7">Net 7 Days</option>
                                        <option value="NET_14">Net 14 Days</option>
                                        <option value="NET_30">Net 30 Days</option>
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        rows="2"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingSupplier ? 'Update' : 'Create'} Supplier
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                    padding: 1rem;
                }
                .modal-container {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                }
                .modal-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body {
                    padding: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default SupplierManagementModal;
