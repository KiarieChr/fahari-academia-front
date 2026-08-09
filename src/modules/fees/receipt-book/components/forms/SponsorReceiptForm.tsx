import React, { useState, useEffect } from 'react';
import { financeService } from '../../../../../services/financeService';
import FilterDropdown from '../../../../../components/ui/FilterDropdown';
import { CreditCard, Building2 } from 'lucide-react';

const SponsorReceiptForm = ({ data, onChange, disabled }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [sponsorships, setSponsorships] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        const fetchFormData = async () => {
            setIsLoadingData(true);
            try {
                const [paymentMethodsRes, sponsorshipsRes] = await Promise.all([
                    financeService.getPaymentMethods(),
                    financeService.getSponsorships()
                ]);
                setPaymentMethods(paymentMethodsRes.results || paymentMethodsRes || []);
                // Filter only active sponsorships
                const activeSponsorships = (sponsorshipsRes.results || sponsorshipsRes || []).filter(s => s.is_active);
                setSponsorships(activeSponsorships);
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

    // Transform data for FilterDropdown
    const sponsorOptions = sponsorships.map(s => ({
        value: s.id,
        label: `${s.name} (${s.sponsor_type_name})`,
        icon: Building2
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
                        const sponsorship = sponsorships.find(s => s.id === val);
                        onChange({
                            ...data,
                            sponsorId: val,
                            sponsorshipId: val,
                            payerName: sponsorship ? sponsorship.name : '',
                            sponsorshipType: sponsorship ? sponsorship.sponsor_type_name : '', // Auto-prefill Sponsor Type classification
                            receiptType: 'Sponsor'
                        });
                    }}
                    searchable={true}
                    disabled={disabled}
                    className="w-100"
                />
            </div>

            {/* Sponsorship Type Classification */}
            <div className="col-md-6">
                <label className="form-label">Sponsor Classification</label>
                <input
                    type="text"
                    className="form-control bg-light"
                    value={data.sponsorshipType || ''}
                    readOnly
                    placeholder="Auto-populated classification"
                    disabled={disabled}
                    style={{ height: '40px' }}
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
