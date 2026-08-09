import React, { useState, useEffect } from 'react';
import { studentManagementService } from '../../../../../services/studentManagementService';
import { feesService } from '../../../../../services/feesService';
import studentSettingsService from '../../../../../services/studentSettingsService';
import { financeService } from '../../../../../services/financeService';
import FilterDropdown from '../../../../../components/ui/FilterDropdown';
import { User, CreditCard } from 'lucide-react';

const StudentFeeReceiptForm = ({ data, onChange, disabled }) => {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentBalance, setStudentBalance] = useState(null);
    const [checkingBalance, setCheckingBalance] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [currentTerm, setCurrentTerm] = useState(null);
    const [currentYear, setCurrentYear] = useState(null);
    const [pendingInvoices, setPendingInvoices] = useState([]);

    // Helper to calculate allocations
    const calculateAllocations = (amount, invoices) => {
        let remaining = amount;
        const newAllocations = [];

        // Sort invoices: Oldest first (FIFO)
        const sortedInvoices = [...invoices].sort((a, b) => new Date(a.date_issued) - new Date(b.date_issued));

        for (const invoice of sortedInvoices) {
            if (remaining <= 0) break;

            // Should verify invoice items are loaded
            if (!invoice.items) continue;

            for (const item of invoice.items) {
                if (remaining <= 0) break;

                // Use balance from backend or calculate
                const due = parseFloat(item.balance !== undefined ? item.balance : (item.amount - (item.amount_paid || 0)));

                if (due > 0) {
                    const allocate = Math.min(remaining, due);
                    newAllocations.push({
                        fee_category_id: item.fee_category, // Now explicitly provided
                        amount: allocate,
                        term_id: invoice.term.id || invoice.term, // Assuming invoice has expanded term/year objects, or IDs
                        academic_year_id: invoice.academic_year.id || invoice.academic_year,
                        invoice_item_id: item.id // Optional: Useful if backend supports direct item allocation
                    });
                    remaining -= allocate;
                }
            }
        }
        return newAllocations;
    };

    useEffect(() => {
        const loadInitialData = async () => {
            // Fetch Students
            fetchStudents();

            // Fetch Payment Methods
            try {
                const pmRes = await financeService.getPaymentMethods();
                // Handle pagination (results array) or direct array
                setPaymentMethods(pmRes.results || pmRes.data || pmRes || []);
            } catch (err) {
                console.error("Failed to load payment methods", err);
            }

            // Fetch Current Term & Year
            try {
                // Get all years, find current
                const yearsRes = await studentSettingsService.getAcademicYears();
                const years = yearsRes.data || yearsRes || [];
                const activeYear = years.find(y => y.is_current) || years[0];

                const updates = {};

                if (activeYear) {
                    setCurrentYear(activeYear.name);
                    updates.year = activeYear.name;
                    updates.academicYearId = activeYear.id;

                    const termsRes = await studentSettingsService.getTerms();
                    const terms = termsRes.data || termsRes || [];
                    const activeTerm = terms.find(t => t.is_current && t.academic_year === activeYear.id)
                        || terms.find(t => t.is_current)
                        || terms[0];

                    if (activeTerm) {
                        setCurrentTerm(activeTerm.name);
                        updates.term = activeTerm.name;
                        updates.termId = activeTerm.id;
                    }
                }

                // Single update
                onChange({ ...data, ...updates, receiptType: 'Student Fee' });
            } catch (err) {
                console.error("Failed to load academic context", err);
            }
        };

        loadInitialData();
    }, []);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            // Fetch all admitted students
            // Adjust params as needed, e.g., page_size=100 or search
            const response = await studentManagementService.getAdmissions({ page_size: 1000, status: 'Active' });
            setStudents(response.results || []);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleStudentChange = async (studentId) => {
        // Find admission object where student ID matches selected value
        const student = students.find(s => s.student === parseInt(studentId));

        const updates = {
            studentId,
            receiptType: 'Student Fee'
        };

        if (student) {
            updates.studentName = student.student_name;
            updates.admissionNo = student.admission_number;
            updates.payerName = student.guardian_name || `Parent of ${student.student_name.split(' ')[0]}`;

            // Check Balance
            checkBalance(studentId);
        } else {
            setStudentBalance(null);
            updates.studentName = '';
            updates.admissionNo = '';
            updates.payerName = '';
        }

        // Single atomic update
        onChange({ ...data, ...updates });
    };

    const checkBalance = async (studentId) => {
        setCheckingBalance(true);
        try {
            const res = await feesService.getStudentBalance(studentId);
            setStudentBalance(res.balance);
        } catch (error) {
            console.error("Failed to check balance:", error);
            setStudentBalance(null);
        } finally {
            setCheckingBalance(false);
        }
    };

    // Fetch Invoices when student changes
    useEffect(() => {
        if (data.studentId) {
            const loadInvoices = async () => {
                try {
                    const invoices = await feesService.getPendingInvoices(data.studentId);
                    // Flatten or use direct array depending on response
                    setPendingInvoices(Array.isArray(invoices) ? invoices : invoices.results || []);
                } catch (err) {
                    console.error("Failed to load invoices", err);
                }
            };
            loadInvoices();
        }
    }, [data.studentId]);

    const handleAmountChange = (val) => {
        const amount = parseFloat(val) || 0;
        const allocations = calculateAllocations(amount, pendingInvoices);

        onChange({
            ...data,
            amount: amount,
            allocations: allocations,
            receiptType: 'Student Fee'
        });
    };

    const handleChange = (field, value) => {
        // If amount changes, we need to recalculate allocations, but handleAmountChange does that.
        // This is for generic fields.
        onChange({ ...data, [field]: value, receiptType: 'Student Fee' });
    };

    // Transform data for FilterDropdown
    const studentOptions = students.map(item => ({
        value: item.student,
        label: `${item.student_name} - ${item.admission_number} (${item.class_name || 'N/A'})`,
        icon: User
    }));

    const paymentMethodOptions = paymentMethods.map(method => ({
        value: method.id || method,
        label: method.name || method,
        icon: CreditCard
    }));

    return (
        <div className="row g-3">
            {/* Student Selector */}
            <div className="col-md-12">
                <label className="form-label">Student <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder={loadingStudents ? "Loading Students..." : "Search and select student..."}
                    value={data.studentId}
                    options={studentOptions}
                    onChange={handleStudentChange}
                    searchable={true}
                    disabled={disabled || loadingStudents}
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
                    style={{ height: '40px' }}
                />
            </div>

            {/* Student Balance (Replaces Fee Category) */}
            <div className="col-md-6">
                <label className="form-label">Current Balance</label>
                <div className={`form-control d-flex justify-content-between align-items-center ${studentBalance > 0 ? 'border-danger text-danger bg-danger-subtle' : studentBalance < 0 ? 'border-success text-success bg-success-subtle' : 'bg-light'}`} style={{ height: '40px' }}>
                    <span>
                        {checkingBalance ? (
                            <span><span className="spinner-border spinner-border-sm me-2" />Checking...</span>
                        ) : studentBalance !== null ? (
                            <strong>KES {parseFloat(studentBalance).toLocaleString()}</strong>
                        ) : (
                            <span className="text-muted">-</span>
                        )}
                    </span>
                    {studentBalance !== null && !checkingBalance && (
                        <span className={`badge ${studentBalance > 0 ? 'bg-danger' : 'bg-success'}`}>
                            {studentBalance > 0 ? 'Arrears' : 'Overpaid'}
                        </span>
                    )}
                </div>
            </div>

            {/* Term (Read-Only) */}
            <div className="col-md-4">
                <label className="form-label">Term</label>
                <input
                    type="text"
                    className="form-control bg-light"
                    value={data.term || currentTerm || ''}
                    readOnly
                    style={{ height: '40px' }}
                />
            </div>

            {/* Academic Year (Read-Only) */}
            <div className="col-md-4">
                <label className="form-label">Academic Year</label>
                <input
                    type="text"
                    className="form-control bg-light"
                    value={data.year || currentYear || ''}
                    readOnly
                    style={{ height: '40px' }}
                />
            </div>

            {/* Amount */}
            <div className="col-md-4">
                <label className="form-label">Amount Paid (KES) <span className="text-danger">*</span></label>
                <input
                    type="number"
                    className="form-control"
                    value={data.amount || ''}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    style={{ height: '40px' }}
                />
            </div>

            {/* Payment Method */}
            <div className="col-md-6">
                <label className="form-label">Payment Method <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Select Payment Method..."
                    value={data.paymentMethodId}
                    options={paymentMethodOptions}
                    onChange={(val) => handleChange('paymentMethodId', val)}
                    disabled={disabled}
                    className="w-100"
                />
            </div>

            {/* Reference Number */}
            <div className="col-md-6">
                <label className="form-label">
                    Reference Number <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={data.reference || ''}
                    onChange={(e) => handleChange('reference', e.target.value)}
                    placeholder={
                        data.paymentMethod === 'M-Pesa' ? 'M-Pesa Code' :
                            data.paymentMethod === 'Bank' ? 'Bank Slip Number' :
                                'Transaction Reference'
                    }
                    required
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
                    placeholder="Additional notes or comments..."
                ></textarea>
            </div>
        </div>
    );
};

export default StudentFeeReceiptForm;
