import React, { useState } from 'react';
import { Save } from 'lucide-react';

const DocumentNumberingSettings = ({ settings, onSave }) => {
    const [formData, setFormData] = React.useState(settings || {});

    React.useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold mb-1">Document Numbering Configuration</h6>
                        <small className="text-muted">Configure automatic numbering for financial documents</small>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="card bg-light border-0">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                    <span className="me-2">🧾</span>
                                    Receipts
                                </h6>

                                <div className="mb-3">
                                    <label className="form-label small">Prefix</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        name="receipt_prefix"
                                        value={formData.receipt_prefix || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="alert alert-secondary mb-0 py-2">
                                    <small className="fw-bold">Preview:</small>
                                    <div className="text-primary fw-bold">{formData.receipt_prefix || 'RCPT'}-001</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Other document types not yet in backend model can be added here as needed */}
                </div>

                <div className="mt-4">
                    <button className="btn btn-primary" onClick={() => onSave(formData)}>
                        <Save size={16} className="me-1" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentNumberingSettings;
