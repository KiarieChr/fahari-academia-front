import React, { useState } from 'react';
import { Save } from 'lucide-react';

const OtherSettings = ({ settings, accounts = [], onSave }) => {
    const [formData, setFormData] = React.useState(settings || {});

    React.useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    return (
        <div className="row g-3">
            {/* Voucher Settings */}
            <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">💳 Payment Voucher Settings</h6>

                        <div className="mb-3">
                            <label className="form-label small">Approval Levels</label>
                            <input
                                type="number"
                                className="form-control"
                                name="voucher_approval_levels"
                                value={formData.voucher_approval_levels || 1}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="voucher_attachments_required"
                                name="voucher_attachments_required"
                                checked={formData.voucher_attachments_required || false}
                                onChange={handleChange}
                            />
                            <label className="form-check-label small" htmlFor="voucher_attachments_required">Require Attachments</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-Billing Settings */}
            <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">📄 Auto-Billing Settings</h6>

                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="auto_billing_enabled"
                                name="auto_billing_enabled"
                                checked={formData.auto_billing_enabled || false}
                                onChange={handleChange}
                            />
                            <label className="form-check-label small" htmlFor="auto_billing_enabled">Enable Auto-Billing</label>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small">Billing Frequency</label>
                            <select
                                className="form-select"
                                name="billing_frequency"
                                value={formData.billing_frequency || 'TERMLY'}
                                onChange={handleChange}
                            >
                                <option value="YEARLY">Yearly</option>
                                <option value="TERMLY">Termly</option>
                                <option value="MONTHLY">Monthly</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small">Default Due Days</label>
                            <input
                                type="number"
                                className="form-control"
                                name="default_billing_days"
                                value={formData.default_billing_days || 14}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Default Accounts Settings */}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">🏦 Default Account Mapping</h6>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Default Receivable Account</label>
                                <select
                                    className="form-select"
                                    name="default_receivable_account"
                                    value={formData.default_receivable_account || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Account --</option>
                                    {accounts
                                        .filter(a => a.sub_type === 'ACCOUNTS_RECEIVABLE' && !a.children?.length)
                                        .map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))
                                    }
                                </select>
                                <div className="form-text x-small">Used for Student Invoicing & Receivables</div>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Default Payable Account</label>
                                <select
                                    className="form-select"
                                    name="default_payable_account"
                                    value={formData.default_payable_account || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Account --</option>
                                    {accounts
                                        .filter(a => a.sub_type === 'ACCOUNTS_PAYABLE' && !a.children?.length)
                                        .map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))
                                    }
                                </select>
                                <div className="form-text x-small">Used for Bills & Vendor Payables</div>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Default Bank Account</label>
                                <select
                                    className="form-select"
                                    name="default_bank_account"
                                    value={formData.default_bank_account || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Account --</option>
                                    {accounts
                                        .filter(a => a.sub_type === 'BANK' && !a.children?.length)
                                        .map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))
                                    }
                                </select>
                                <div className="form-text x-small">Default for Bank Reconciliations</div>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Default Prepayment Account</label>
                                <select
                                    className="form-select"
                                    name="default_prepayment_account"
                                    value={formData.default_prepayment_account || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Account --</option>
                                    {accounts
                                        .filter(a => a.type === 'LIABILITY' && !a.children?.length)
                                        .map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))
                                    }
                                </select>
                                <div className="form-text x-small">Used for Student Prepayments/Unallocated Credits</div>
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Sundry/Other Debtors Account</label>
                                <select
                                    className="form-select"
                                    name="default_sundry_debtors_account"
                                    value={formData.default_sundry_debtors_account || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Account --</option>
                                    {accounts
                                        .filter(a => a.type === 'ASSET' && !a.children?.length)
                                        .map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))
                                    }
                                </select>
                                <div className="form-text x-small">Used for Customer Invoices (non-student debtors)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Imprest Settings */}
            <div className="col-md-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">💼 Imprest Document Settings</h6>

                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Maximum Imprest Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="imprest_max_amount"
                                    value={formData.imprest_max_amount || 0}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Surrender Days</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="imprest_surrender_days"
                                    value={formData.imprest_surrender_days || 7}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4 mb-3">
                                <label className="form-label small">Approval Levels</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="imprest_approval_levels"
                                    value={formData.imprest_approval_levels || 1}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12">
                <button className="btn btn-primary" onClick={() => onSave(formData)}>
                    <Save size={16} className="me-1" /> Save All Changes
                </button>
            </div>
        </div>
    );
};

export default OtherSettings;
