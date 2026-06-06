import React, { useState, useEffect } from 'react';
import { financeService } from '../../../../../services/financeService';
import FilterDropdown from '../../../../../components/ui/FilterDropdown';
import { Landmark, CreditCard } from 'lucide-react';

const GeneralReceiptForm = ({ data, onChange, disabled }) => {
    const [incomeAccounts, setIncomeAccounts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        const fetchFormData = async () => {
            setIsLoadingData(true);
            try {
                const [paymentMethodsRes, accountsRes] = await Promise.all([
                    financeService.getPaymentMethods(),
                    financeService.getAccounts()
                ]);

                setPaymentMethods(paymentMethodsRes.results || paymentMethodsRes || []);
                
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
        onChange({ ...data, [field]: value, receiptType: 'General' });
    };

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
            {/* Payer Name */}
            <div className="col-md-12">
                <label className="form-label">Payer Name <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={data.payerName || ''}
                    onChange={(e) => handleChange('payerName', e.target.value)}
                    placeholder="Individual or organization name"
                    required
                    disabled={disabled}
                    style={{ height: '40px' }}
                />
            </div>

            {/* Income Account */}
            <div className="col-md-6">
                <label className="form-label">Income Account <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Select Income Account..."
                    value={data.incomeAccountId}
                    options={accountOptions}
                    onChange={(val) => {
                        const account = incomeAccounts.find(acc => String(acc.id) === String(val));
                        onChange({
                            ...data,
                            incomeAccountId: val,
                            incomeAccount: account ? account.name : '',
                            receiptType: 'General'
                        });
                    }}
                    searchable={true}
                    disabled={disabled || isLoadingData}
                    className="w-100"
                />
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

            {/* Description */}
            <div className="col-md-12">
                <label className="form-label">Description <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={data.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="What is this payment for?"
                    required
                    disabled={disabled}
                    style={{ height: '40px' }}
                />
            </div>

            {/* Payment Method */}
            <div className="col-md-6">
                <label className="form-label">Payment Method <span className="text-danger">*</span></label>
                <FilterDropdown
                    placeholder="Select Method..."
                    value={data.paymentMethodId}
                    options={paymentMethodOptions}
                    onChange={(val) => {
                        const method = paymentMethods.find(m => String(m.id) === String(val));
                        onChange({
                            ...data,
                            paymentMethodId: val,
                            paymentMethod: method ? method.name : '',
                            receiptType: 'General'
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

export default GeneralReceiptForm;
