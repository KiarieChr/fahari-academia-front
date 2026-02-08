import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import GeneralVoucherForm from './GeneralVoucherForm';
import APVoucherForm from './APVoucherForm';
import RefundVoucherForm from './RefundVoucherForm';
import { generateVoucherNumber } from '../utils/formatters';

const VoucherCreationModal = ({ onClose, onVoucherCreated, prefilledData, procurementInvoices, customerInvoices, chartOfAccounts }) => {
    const [step, setStep] = useState(1);
    const [voucherType, setVoucherType] = useState(prefilledData?.voucherType || '');
    const [voucherData, setVoucherData] = useState({
        voucherNumber: generateVoucherNumber(),
        voucherDate: new Date().toISOString().split('T')[0],
        term: 'Term 1',
        ...prefilledData
    });

    const voucherTypes = [
        {
            value: 'General Payment',
            label: 'General Payment Voucher',
            description: 'For utilities, repairs, and miscellaneous expenses',
            icon: '📄'
        },
        {
            value: 'AP Payment',
            label: 'Accounts Payable Payment Voucher',
            description: 'For supplier payments from procurement invoices',
            icon: '🧾'
        },
        {
            value: 'Refund Payment',
            label: 'Refund Payment Voucher',
            description: 'For student/sponsor refunds and overpayments',
            icon: '💸'
        }
    ];

    const handleTypeSelect = (type) => {
        setVoucherType(type);
        setVoucherData({ ...voucherData, voucherType: type });
        setStep(2);
    };

    const handleSubmit = (formData) => {
        const newVoucher = {
            id: `PV-${Date.now()}`,
            ...voucherData,
            ...formData,
            approvalStatus: 'Pending Approval',
            postingStatus: 'Unposted',
            createdBy: 'Accounts Clerk',
            createdDate: new Date().toISOString()
        };
        onVoucherCreated(newVoucher);
        onClose();
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <div>
                            <h5 className="modal-title fw-bold">Create Payment Voucher</h5>
                            <small className="text-muted">
                                Step {step} of 2: {step === 1 ? 'Select Voucher Type' : 'Fill Voucher Details'}
                            </small>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="px-4 pb-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className={`flex-grow-1 bg-${step >= 1 ? 'primary' : 'light'} rounded`} style={{ height: '4px' }}></div>
                            <div className={`flex-grow-1 bg-${step >= 2 ? 'primary' : 'light'} rounded`} style={{ height: '4px' }}></div>
                        </div>
                    </div>

                    <div className="modal-body">
                        {step === 1 && (
                            <div className="row g-3">
                                {voucherTypes.map((type) => (
                                    <div key={type.value} className="col-md-4">
                                        <div
                                            className="card h-100 border-2 cursor-pointer hover-shadow"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleTypeSelect(type.value)}
                                        >
                                            <div className="card-body text-center">
                                                <div className="display-4 mb-3">{type.icon}</div>
                                                <h6 className="fw-bold mb-2">{type.label}</h6>
                                                <p className="text-muted small mb-3">{type.description}</p>
                                                <button className="btn btn-outline-primary btn-sm">
                                                    Select <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 2 && voucherType === 'General Payment' && (
                            <GeneralVoucherForm
                                voucherData={voucherData}
                                chartOfAccounts={chartOfAccounts}
                                onSubmit={handleSubmit}
                                onBack={() => setStep(1)}
                            />
                        )}

                        {step === 2 && voucherType === 'AP Payment' && (
                            <APVoucherForm
                                voucherData={voucherData}
                                chartOfAccounts={chartOfAccounts}
                                procurementInvoices={procurementInvoices}
                                onSubmit={handleSubmit}
                                onBack={() => setStep(1)}
                            />
                        )}

                        {step === 2 && voucherType === 'Refund Payment' && (
                            <RefundVoucherForm
                                voucherData={voucherData}
                                chartOfAccounts={chartOfAccounts}
                                customerInvoices={customerInvoices}
                                onSubmit={handleSubmit}
                                onBack={() => setStep(1)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherCreationModal;
