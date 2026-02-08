import React from 'react';
import { mockSponsors, mockStudents, paymentMethods } from '../../data/mockReceiptData';

const SponsorReceiptForm = ({ data, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value, receiptType: 'Sponsor' });
    };

    const handleStudentSelection = (studentId) => {
        const currentStudents = data.sponsoredStudents || [];
        if (currentStudents.includes(studentId)) {
            handleChange('sponsoredStudents', currentStudents.filter(id => id !== studentId));
        } else {
            handleChange('sponsoredStudents', [...currentStudents, studentId]);
        }
    };

    return (
        <div className="row g-3">
            {/* Sponsor Selector */}
            <div className="col-md-12">
                <label className="form-label">Sponsor/Donor <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.sponsorId || ''}
                    onChange={(e) => {
                        const sponsor = mockSponsors.find(s => s.id === e.target.value);
                        handleChange('sponsorId', e.target.value);
                        if (sponsor) {
                            handleChange('payerName', sponsor.name);
                        }
                    }}
                    required
                >
                    <option value="">Select Sponsor...</option>
                    {mockSponsors.map(sponsor => (
                        <option key={sponsor.id} value={sponsor.id}>
                            {sponsor.name} ({sponsor.type})
                        </option>
                    ))}
                </select>
            </div>

            {/* Sponsorship Type */}
            <div className="col-md-6">
                <label className="form-label">Sponsorship Type <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.sponsorshipType || ''}
                    onChange={(e) => handleChange('sponsorshipType', e.target.value)}
                    required
                >
                    <option value="">Select Type...</option>
                    <option value="Full Scholarship">Full Scholarship</option>
                    <option value="Partial Scholarship">Partial Scholarship</option>
                    <option value="One-Time Donation">One-Time Donation</option>
                </select>
            </div>

            {/* Amount */}
            <div className="col-md-6">
                <label className="form-label">Amount (KES) <span className="text-danger">*</span></label>
                <input
                    type="number"
                    className="form-control"
                    value={data.amount || ''}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                />
            </div>

            {/* Sponsored Students */}
            <div className="col-md-12">
                <label className="form-label">Sponsored Student(s) <span className="text-danger">*</span></label>
                <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {mockStudents.map(student => (
                        <div key={student.id} className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`student-${student.id}`}
                                checked={(data.sponsoredStudents || []).includes(student.id)}
                                onChange={() => handleStudentSelection(student.id)}
                            />
                            <label className="form-check-label" htmlFor={`student-${student.id}`}>
                                {student.name} - {student.admissionNo} ({student.class})
                            </label>
                        </div>
                    ))}
                </div>
                <small className="text-muted">
                    Selected: {(data.sponsoredStudents || []).length} student(s)
                </small>
            </div>

            {/* Allocation Rule */}
            <div className="col-md-12">
                <label className="form-label">Allocation Rule</label>
                <input
                    type="text"
                    className="form-control"
                    value={data.allocationRule || ''}
                    onChange={(e) => handleChange('allocationRule', e.target.value)}
                    placeholder="e.g., Equal distribution, Specific amounts per student"
                />
            </div>

            {/* Payment Method */}
            <div className="col-md-6">
                <label className="form-label">Payment Method <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.paymentMethod || ''}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    required
                >
                    <option value="">Select Method...</option>
                    {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </div>

            {/* Reference Number */}
            <div className="col-md-6">
                <label className="form-label">
                    Reference {data.paymentMethod && data.paymentMethod !== 'Cash' && <span className="text-danger">*</span>}
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={data.reference || ''}
                    onChange={(e) => handleChange('reference', e.target.value)}
                    placeholder="Reference number"
                    required={data.paymentMethod && data.paymentMethod !== 'Cash'}
                />
            </div>

            {/* Notes */}
            <div className="col-md-12">
                <label className="form-label">Notes / Remarks</label>
                <textarea
                    className="form-control"
                    rows="2"
                    value={data.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes or special instructions..."
                ></textarea>
            </div>
        </div>
    );
};

export default SponsorReceiptForm;
