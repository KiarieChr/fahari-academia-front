import React from 'react';
import { mockStudents, nonFeeCategories, paymentMethods } from '../../data/mockReceiptData';

const StudentNonFeeReceiptForm = ({ data, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value, receiptType: 'Student Non-Fee' });
    };

    return (
        <div className="row g-3">
            {/* Student Selector */}
            <div className="col-md-12">
                <label className="form-label">Student <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.studentId || ''}
                    onChange={(e) => {
                        const student = mockStudents.find(s => s.id === e.target.value);
                        handleChange('studentId', e.target.value);
                        if (student) {
                            handleChange('studentName', student.name);
                            handleChange('admissionNo', student.admissionNo);
                            handleChange('payerName', `Parent of ${student.name}`);
                        }
                    }}
                    required
                >
                    <option value="">Select Student...</option>
                    {mockStudents.map(student => (
                        <option key={student.id} value={student.id}>
                            {student.name} - {student.admissionNo} ({student.class})
                        </option>
                    ))}
                </select>
            </div>

            {/* Payer Name */}
            <div className="col-md-6">
                <label className="form-label">Payer Name <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={data.payerName || ''}
                    onChange={(e) => handleChange('payerName', e.target.value)}
                    placeholder="Parent/Guardian name"
                    required
                />
            </div>

            {/* Non-Fee Category */}
            <div className="col-md-6">
                <label className="form-label">Non-Fee Category <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.nonFeeCategory || ''}
                    onChange={(e) => handleChange('nonFeeCategory', e.target.value)}
                    required
                >
                    <option value="">Select Category...</option>
                    {nonFeeCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <div className="col-md-12">
                <label className="form-label">Description <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={data.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="e.g., Full uniform set, Science trip to Nairobi, etc."
                    required
                />
            </div>

            {/* Amount */}
            <div className="col-md-4">
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

            {/* Payment Method */}
            <div className="col-md-4">
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
            <div className="col-md-4">
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
                <label className="form-label">Notes</label>
                <textarea
                    className="form-control"
                    rows="2"
                    value={data.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                ></textarea>
            </div>
        </div>
    );
};

export default StudentNonFeeReceiptForm;
