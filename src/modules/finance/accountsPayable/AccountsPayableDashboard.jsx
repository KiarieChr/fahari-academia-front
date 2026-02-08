import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FileSpreadsheet, Printer, Bell } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import DashboardSummary from './components/DashboardSummary';
import CustomerInvoicesTab from './components/CustomerInvoicesTab';
import ProcurementAPTab from './components/ProcurementAPTab';
import PaymentVouchersTab from './components/PaymentVouchersTab';
import VoucherPostingTab from './components/VoucherPostingTab';
import RefundsTab from './components/RefundsTab';
import ReportsTab from './components/ReportsTab';
import CreateCustomerInvoiceModal from './components/CreateCustomerInvoiceModal.jsx';
import CreateVendorBillModal from './components/CreateVendorBillModal.jsx';
import './AccountsPayable.css';
import {
    customerInvoices,
    procurementAPInvoices,
    paymentVouchers,
    refunds,
    summaryStats,
    apAgingData,
    voucherTypeData,
    supplierSummary,
    postingStats,
    chartOfAccounts
} from './data/mockData';
import { financeService } from '../../../services/financeService';



const AccountsPayableDashboard = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [selectedYear, setSelectedYear] = useState('2026');

    // Local state for dynamic data
    const [localCustomerInvoices, setLocalCustomerInvoices] = useState([]);
    const [localProcurementInvoices, setLocalProcurementInvoices] = useState([]);
    const [localVouchers, setLocalVouchers] = useState(paymentVouchers);
    const [localRefunds, setLocalRefunds] = useState(refunds);
    const [loading, setLoading] = useState(true);

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);

    const loadHbData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, billsRes] = await Promise.all([
                financeService.getInvoices(),
                financeService.getBills()
            ]);
            setLocalCustomerInvoices(invoicesRes.data.results || invoicesRes.data || []);
            setLocalProcurementInvoices(billsRes.data.results || billsRes.data || []);
        } catch (error) {
            console.error("Failed to load Finance data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHbData();
    }, []);

    const handleCreateRefund = (invoice) => {
        // This would open the voucher creation modal with refund type pre-selected
        setActiveTab('vouchers');
        // In a real implementation, you'd pass the invoice data to the modal
    };

    const handleCreateVoucherFromInvoice = (invoice) => {
        // Mark invoice as linked
        // In real app, we would create a voucher backend object here
        setActiveTab('vouchers');
    };

    const handleVoucherCreated = (newVoucher) => {
        setLocalVouchers(prev => [...prev, newVoucher]);
        alert('Voucher created successfully!');
    };

    const handleVoucherPosted = (voucherId) => {
        setLocalVouchers(prev =>
            prev.map(voucher =>
                voucher.id === voucherId
                    ? {
                        ...voucher,
                        postingStatus: 'Posted',
                        postedBy: 'Bursar',
                        postedDate: new Date().toISOString()
                    }
                    : voucher
            )
        );
        alert('Voucher posted successfully!');
    };

    const tabs = [
        { id: 'summary', label: 'Summary', icon: '📊' },
        { id: 'customer-invoices', label: 'Customer Invoices', icon: '💰' },
        { id: 'ap-invoices', label: 'AP Invoices', icon: '📦' },
        { id: 'vouchers', label: 'Payment Vouchers', icon: '💳' },
        { id: 'posting', label: 'Voucher Posting', icon: '✅' },
        { id: 'refunds', label: 'Refunds', icon: '💸' },
        { id: 'reports', label: 'Reports', icon: '📈' }
    ];

    const overdueCount = localProcurementInvoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        return dueDate < new Date() && !inv.linkedToVoucher;
    }).length;

    return (
        <DashboardLayout title="Accounts Payable">
            <div className="dashboard-main-content">
                {/* Header Section */}
                <div className="dashboard-top-section">
                    <div>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                            <span className="d-flex align-items-center gap-1">
                                <Calendar size={14} /> Academic Year: <strong>{selectedYear}</strong>
                            </span>
                            <span className="d-flex align-items-center gap-1">
                                <Filter size={14} /> Current Term: <strong>{selectedTerm}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="dashboard-actions">
                        <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-1">
                                <Printer size={14} /> Print
                            </button>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-1">
                                <FileSpreadsheet size={14} /> Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alert for overdue items */}
                {overdueCount > 0 && (
                    <div className="alert alert-warning d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 bg-warning-subtle text-warning rounded-circle">
                                <Bell size={20} />
                            </div>
                            <div>
                                <div className="fw-bold">Payment Deadlines</div>
                                <small className="text-muted">
                                    {overdueCount} invoice{overdueCount > 1 ? 's are' : ' is'} overdue and require{overdueCount === 1 ? 's' : ''} immediate attention.
                                </small>
                            </div>
                        </div>
                        <button className="btn btn-sm btn-outline-warning">View Details</button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="ap-tabs-container mb-4">
                    <div className="ap-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`ap-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="me-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="ap-tab-content">
                    {activeTab === 'summary' && (
                        <div>
                            <DashboardSummary stats={summaryStats} />
                            <div className="row">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <h6 className="fw-bold mb-3">Quick Overview</h6>
                                            <p className="text-muted">
                                                Welcome to the Accounts Payable Dashboard. Use the tabs above to navigate through different sections:
                                            </p>
                                            <ul className="text-muted">
                                                <li><strong>Customer Invoices:</strong> Manage student and sponsor invoices, track overpayments</li>
                                                <li><strong>AP Invoices:</strong> Pick approved invoices from procurement for payment</li>
                                                <li><strong>Payment Vouchers:</strong> Create and manage payment vouchers (General, AP, Refund)</li>
                                                <li><strong>Voucher Posting:</strong> Review and post approved vouchers to the ledger</li>
                                                <li><strong>Refunds:</strong> Track all refund vouchers issued</li>
                                                <li><strong>Reports:</strong> View analytics, aging summaries, and export data</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'customer-invoices' && (
                        <CustomerInvoicesTab
                            invoices={localCustomerInvoices}
                            onCreateRefund={handleCreateRefund}
                            onCreateInvoice={() => setShowInvoiceModal(true)}
                        />
                    )}

                    {activeTab === 'ap-invoices' && (
                        <ProcurementAPTab
                            invoices={localProcurementInvoices}
                            onCreateVoucher={handleCreateVoucherFromInvoice}
                            onCreateBill={() => setShowBillModal(true)}
                        />
                    )}

                    {activeTab === 'vouchers' && (
                        <PaymentVouchersTab
                            vouchers={localVouchers}
                            onVoucherCreated={handleVoucherCreated}
                            procurementInvoices={localProcurementInvoices}
                            customerInvoices={localCustomerInvoices}
                            chartOfAccounts={chartOfAccounts}
                        />
                    )}

                    {activeTab === 'posting' && (
                        <VoucherPostingTab
                            vouchers={localVouchers}
                            onVoucherPosted={handleVoucherPosted}
                        />
                    )}

                    {activeTab === 'refunds' && (
                        <RefundsTab refunds={localRefunds} />
                    )}

                    {activeTab === 'reports' && (
                        <ReportsTab
                            agingData={apAgingData}
                            voucherTypeData={voucherTypeData}
                            supplierSummary={supplierSummary}
                            postingStats={postingStats}
                        />
                    )}
                </div>
            </div>

            <CreateCustomerInvoiceModal
                show={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                onSave={() => loadHbData()} // Refresh data
            />

            <CreateVendorBillModal
                show={showBillModal}
                onClose={() => setShowBillModal(false)}
                onSave={() => loadHbData()} // Refresh data
            />
        </DashboardLayout>
    );
};

export default AccountsPayableDashboard;
