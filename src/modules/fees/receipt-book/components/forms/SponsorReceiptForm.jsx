import React, { useState, useEffect } from 'react';
import { studentManagementService } from '../../../../../services/studentManagementService';
import { financeService } from '../../../../../services/financeService';
import FilterDropdown from '../../../../../components/ui/FilterDropdown';
import { User, CreditCard, Building2 } from 'lucide-react';
import { mockSponsors } from '../../data/mockReceiptData'; // Keep mock for now as no service found

const SponsorReceiptForm = ({ data, onChange, disabled }) => {
    const [students, setStudents] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        const fetchFormData = async () => {
            setIsLoadingData(true);
            try {
                const [studentsRes, paymentMethodsRes] = await Promise.all([
                    studentManagementService.getAdmissions({ page_size: 1000, status: 'Active' }),
                    financeService.getPaymentMethods()
                ]);

                setStudents(studentsRes.results || studentsRes || []);
                setPaymentMethods(paymentMethodsRes.results || paymentMethodsRes || []);
            } catch (error) {
                console.error('Error fetching form data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchFormData();
    }, []);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value, receiptType: 'Sponsor' });
    };

    const handleStudentSelection = (studentIds) => {
        handleChange('sponsoredStudents', studentIds);
    };

    // Transform data for FilterDropdown
    const sponsorOptions = mockSponsors.map(s => ({
        value: s.id,
        label: `${s.name} (${s.type})`,
        icon: Building2
    }));

    const studentOptions = students.map(s => ({
        value: s.id,
        label: `${s.name} - ${s.admission_number || s.admissionNo} (${s.class_name || s.class || 'N/A'})`,
        icon: User
    }));

    const paymentMethodOptions = paymentMethods.map(m => ({
        value: m.id,
        label: m.name,
        icon: CreditCard
    }));

    return (
        <div className="row g-3">
            {/* Sponsor Selector */}
            <div className="col-md-12">
                <label className="form-label">Sponsor/Donor <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Search and select sponsor..."
                    value={data.sponsorId}
                    options={sponsorOptions}
                    onChange={(val) => {
                        const sponsor = mockSponsors.find(s => s.id === val);
                        onChange({
                            ...data,
                            sponsorId: val,
                            payerName: sponsor ? sponsor.name : '',
                            receiptType: 'Sponsor'
                        });
                    }}
                    searchable={true}
                    disabled={disabled}
                    className="w-100"
                />
            </div>

            {/* Sponsorship Type */}
            <div className="col-md-6">
                <label className="form-label">Sponsorship Type <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.sponsorshipType || ''}
                    onChange={(e) => handleChange('sponsorshipType', e.target.value)}
                    required
                    disabled={disabled}
                    style={{ height: '40px' }}
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
                    disabled={disabled}
                    style={{ height: '40px' }}
                />
            </div>

            {/* Sponsored Students */}
            <div className="col-md-12">
                <label className="form-label">Sponsored Student(s) <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Select students..."
                    value={data.sponsoredStudents || []}
                    options={studentOptions}
                    onChange={handleStudentSelection}
                    multiple={true}
                    searchable={true}
                    disabled={disabled || isLoadingData}
                    className="w-100"
                />
                <small className="text-muted mt-1 d-block">
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
                    disabled={disabled}
                    style={{ height: '40px' }}
                />
            </div>

            {/* Payment Method */}
            <div className="col-md-6">
                <label className="form-label">Payment Method <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Select method..."
                    value={data.paymentMethodId}
                    options={paymentMethodOptions}
                    onChange={(val) => {
                        const method = paymentMethods.find(m => String(m.id) === String(val));
                        onChange({
                            ...data,
                            paymentMethodId: val,
                            paymentMethod: method ? method.name : '',
                            receiptType: 'Sponsor'
                        });
                    }}
                    disabled={disabled || isLoadingData}
                    className="w-100"
                />
            </div>

            {/* Reference Number */}
            <div className="col-md-6">
                <label className="form-label">
                    Reference <span className="text-muted small">(Optional for Cash)</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={data.reference || ''}
                    onChange={(e) => handleChange('reference', e.target.value)}
                    placeholder="Reference number"
                    disabled={disabled}
                    style={{ height: '40px' }}
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
                    disabled={disabled}
                ></textarea>
            </div>
        </div>
    );
};

export default SponsorReceiptForm;
