import React, { useState } from 'react';
import { Eye, Save } from 'lucide-react';

const ReceiptFormatSettings = ({ settings, onSave }) => {
    const [formData, setFormData] = React.useState(settings || {});

    React.useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold mb-1">Receipt Format & Appearance</h6>
                        <small className="text-muted">Configure how receipts appear when printed</small>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Footer Note</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                name="receipt_footer_message"
                                value={formData.receipt_footer_message || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card bg-light border-0 mb-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">Display Options</h6>

                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="receipt_show_balance"
                                        name="receipt_show_balance"
                                        checked={formData.receipt_show_balance || false}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="receipt_show_balance">Show Balance After Payment</label>
                                </div>

                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="receipt_show_voteheads"
                                        name="receipt_show_voteheads"
                                        checked={formData.receipt_show_voteheads || false}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="receipt_show_voteheads">Show Voteheads Breakdown</label>
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-primary w-100" onClick={() => onSave(formData)}>
                            <Save size={16} className="me-1" /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptFormatSettings;
