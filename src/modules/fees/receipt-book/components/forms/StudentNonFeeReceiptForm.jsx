import React, { useState, useEffect } from 'react';
import { studentManagementService } from '../../../../../services/studentManagementService';
import { financeService } from '../../../../../services/financeService';
import FilterDropdown from '../../../../../components/ui/FilterDropdown';
import { User, Landmark, CreditCard } from 'lucide-react';

const StudentNonFeeReceiptForm = ({ data, onChange, disabled }) => {
    const [students, setStudents] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [incomeAccounts, setIncomeAccounts] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        const fetchFormData = async () => {
            setIsLoadingData(true);
            try {
                const [studentsRes, paymentMethodsRes, accountsRes] = await Promise.all([
                    studentManagementService.getAdmissions({ page_size: 1000, status: 'Active' }),
                    financeService.getPaymentMethods(),
                    financeService.getAccounts()
                ]);

                // Handle both paginated and direct array responses
                setStudents(studentsRes.results || studentsRes || []);
                setPaymentMethods(paymentMethodsRes.results || paymentMethodsRes || []);
                
                // Filter for income accounts
                const accounts = accountsRes.results || accountsRes || [];
                setIncomeAccounts(accounts.filter(acc => 
                    acc.account_type?.toLowerCase().includes('income') || 
                    acc.type?.toLowerCase().includes('income') ||
                    acc.category?.toLowerCase().includes('income')
                ));

            } catch (error) {
                console.error('Error fetching form data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchFormData();
    }, []);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value, receiptType: 'Student Non-Fee' });
    };

    const handleStudentChange = (studentId) => {
        const student = students.find(s => String(s.id) === String(studentId));
        if (student) {
            onChange({
                ...data,
                studentId: student.id,
                studentName: student.name,
                admissionNo: student.admission_number || student.admissionNo,
                payerName: `Parent of ${student.name}`,
                receiptType: 'Student Non-Fee'
            });
        } else {
            handleChange('studentId', studentId);
        }
    };

    // Transform data for FilterDropdown
    const studentOptions = students.map(s => ({
        value: s.id,
        label: `${s.name} - ${s.admission_number || s.admissionNo} (${s.class_name || s.class || 'N/A'})`,
        icon: User
    }));

    const accountOptions = incomeAccounts.map(acc => ({
        value: acc.id,
        label: `${acc.code} - ${acc.name}`,
        icon: Landmark
    }));

    const paymentMethodOptions = paymentMethods.map(m => ({
        value: m.id,
        label: m.name,
        icon: CreditCard
    }));

    return (
        <div className="row g-3">
            {/* Student Selector */}
            <div className="col-md-12">
                <label className="form-label">Student <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder={isLoadingData ? "Loading students..." : "Search and select student..."}
                    value={data.studentId}
                    options={studentOptions}
                    onChange={handleStudentChange}
                    searchable={true}
                    disabled={disabled || isLoadingData}
                    className="w-100"
                />
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
                    disabled={disabled}
                    style={{ height: '40px' }}
                />
            </div>

            {/* Income Account / Non-Fee Category */}
            <div className="col-md-6">
                <label className="form-label">Income Category <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Select income category..."
                    value={data.incomeAccountId}
                    options={accountOptions}
                    onChange={(val) => {
                        const account = incomeAccounts.find(acc => String(acc.id) === String(val));
                        onChange({
                            ...data,
                            incomeAccountId: val,
                            nonFeeCategory: account ? account.name : '',
                            receiptType: 'Student Non-Fee'
                        });
                    }}
                    searchable={true}
                    disabled={disabled || isLoadingData}
                    className="w-100"
                />
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
                    disabled={disabled}
                    style={{ height: '40px' }}
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
                    disabled={disabled}
                    style={{ height: '40px' }}
                />
            </div>

            {/* Payment Method */}
            <div className="col-md-4">
                <label className="form-label">Payment Method <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Select payment method..."
                    value={data.paymentMethodId}
                    options={paymentMethodOptions}
                    onChange={(val) => {
                        const method = paymentMethods.find(m => String(m.id) === String(val));
                        onChange({
                            ...data,
                            paymentMethodId: val,
                            paymentMethod: method ? method.name : '',
                            receiptType: 'Student Non-Fee'
                        });
                    }}
                    disabled={disabled || isLoadingData}
                    className="w-100"
                />
            </div>

            {/* Reference Number */}
            <div className="col-md-4">
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
                <label className="form-label">Notes</label>
                <textarea
                    className="form-control"
                    rows="2"
                    value={data.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    disabled={disabled}
                ></textarea>
            </div>
        </div>
    );
};

export default StudentNonFeeReceiptForm;
