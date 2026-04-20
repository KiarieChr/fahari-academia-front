import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FileSpreadsheet, Printer, Bell, Building2, Plus } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import DashboardSummary from './components/DashboardSummary';
import CustomerInvoicesTab from './components/CustomerInvoicesTab';
import ProcurementAPTab from './components/ProcurementAPTab';
import PaymentVouchersTab from './components/PaymentVouchersTab';
import EnhancedPaymentVouchersTab from './components/EnhancedPaymentVouchersTab';
import VoucherPostingTab from './components/VoucherPostingTab';
import RefundsTab from './components/RefundsTab';
import ReportsTab from './components/ReportsTab';
import CreateCustomerInvoiceModal from './components/CreateCustomerInvoiceModal.jsx';
import CreateSupplierInvoiceModal from './components/CreateSupplierInvoiceModal.jsx';
// New Accounts Payable Components
import SupplierInvoicesTab from './components/SupplierInvoicesTab';
import ImprestRetirementTab from './components/ImprestRetirementTab';
import SupplierManagementModal from './components/SupplierManagementModal';
import CreatePaymentVoucherModal from './components/CreatePaymentVoucherModal';
import PaymentVoucherDetailModal from './components/PaymentVoucherDetailModal';
import ApprovalThresholdsTab from './components/ApprovalThresholdsTab';
import './AccountsPayable.css';
import {
    customerInvoices,
    procurementAPInvoices,
    paymentVouchers,
    refunds,
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
    const [showBillModal, setShowBillModal] = useState(false);  // now opens unified supplier invoice modal

    // New modal states for enhanced AP functionality
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showCreateVoucherModal, setShowCreateVoucherModal] = useState(false);
    const [showVoucherDetailModal, setShowVoucherDetailModal] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);
    const [voucherPrefilledData, setVoucherPrefilledData] = useState(null);

    const loadHbData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, billsRes] = await Promise.all([
                financeService.getInvoices().catch(() => null),
                financeService.getBills().catch(() => null)
            ]);
            setLocalCustomerInvoices(invoicesRes?.results || invoicesRes || []);
            setLocalProcurementInvoices(billsRes?.results || billsRes || []);
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
        setVoucherPrefilledData({
            voucher_type: 'REFUND',
            payee_name: invoice.name || invoice.customerName || '',
            amount: Math.abs(invoice.balance || 0),
            description: `Refund for overpayment - ${invoice.invoiceNumber || invoice.invoice_number || ''}`
        });
        setShowCreateVoucherModal(true);
    };

    const handleCreateVoucherFromInvoice = (invoice) => {
        setVoucherPrefilledData({
            voucher_type: 'AP',
            amount: parseFloat(invoice.totalAmount || invoice.total_amount || 0),
            description: `Payment for ${invoice.supplierName || invoice.supplier_name || ''} - ${invoice.invoiceNumber || invoice.invoice_number || ''}`
        });
        setShowCreateVoucherModal(true);
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
        { id: 'supplier-invoices', label: 'Supplier Invoices', icon: '🏢' },
        { id: 'ap-invoices', label: 'AP Invoices', icon: '📦' },
        { id: 'vouchers', label: 'Payment Vouchers', icon: '💳' },
        { id: 'imprest', label: 'Imprest Retirement', icon: '🧾' },
        { id: 'posting', label: 'Voucher Posting', icon: '✅' },
        { id: 'refunds', label: 'Refunds', icon: '💸' },
        { id: 'reports', label: 'Reports', icon: '📈' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    // Helper functions for new voucher workflow
    const handleOpenVoucherDetail = (voucherId) => {
        setSelectedVoucherId(voucherId);
        setShowVoucherDetailModal(true);
    };

    const handleCreateVoucherFromSupplierInvoice = (invoice) => {
        setVoucherPrefilledData({
            voucher_type: 'AP',
            supplier_invoice: invoice.id,
            amount: invoice.balance,
            description: `Payment for invoice ${invoice.invoice_number}`
        });
        setShowCreateVoucherModal(true);
    };

    const handleVoucherModalClose = () => {
        setShowCreateVoucherModal(false);
        setVoucherPrefilledData(null);
    };

    const handleVoucherDetailClose = () => {
        setShowVoucherDetailModal(false);
        setSelectedVoucherId(null);
    };

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
                    <div className="dashboard-actions d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => setShowSupplierModal(true)}
                        >
                            <Building2 size={14} /> Suppliers
                        </button>
                        <button
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                            onClick={() => setShowCreateVoucherModal(true)}
                        >
                            <Plus size={14} /> New Voucher
                        </button>
                        <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={() => window.print()}>
                                <Printer size={14} /> Print
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

                {/* Vertical Tabs + Content Layout */}
                <div className="ap-layout">
                <div className="ap-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`ap-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="ap-tab-icon">{tab.icon}</span>
                            <span className="ap-tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="ap-tab-content">
                    {activeTab === 'summary' && (
                        <div>
                            <DashboardSummary />
                            <div className="row">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <h6 className="fw-bold mb-3">Quick Overview</h6>
                                            <p className="text-muted">
                                                Welcome to the Accounts Payable Dashboard. Use the sidebar to navigate through different sections:
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
                            onCreateRefund={handleCreateRefund}
                            onCreateInvoice={() => setShowInvoiceModal(true)}
                        />
                    )}

                    {activeTab === 'supplier-invoices' && (
                        <SupplierInvoicesTab 
                            onCreateVoucher={handleCreateVoucherFromSupplierInvoice}
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
                        <EnhancedPaymentVouchersTab
                            onViewDetail={handleOpenVoucherDetail}
                            onCreateVoucher={() => setShowCreateVoucherModal(true)}
                        />
                    )}

                    {activeTab === 'imprest' && (
                        <ImprestRetirementTab />
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
                        <ReportsTab />
                    )}

                    {activeTab === 'settings' && (
                        <ApprovalThresholdsTab />
                    )}
                </div>
                </div>
            </div>

            <CreateCustomerInvoiceModal
                show={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                onSave={() => loadHbData()} // Refresh data
            />

            <CreateSupplierInvoiceModal
                show={showBillModal}
                onClose={() => setShowBillModal(false)}
                onCreated={() => { setShowBillModal(false); loadHbData(); }}
            />

            {/* New AP Module Modals */}
            <SupplierManagementModal
                show={showSupplierModal}
                onClose={() => setShowSupplierModal(false)}
            />

            <CreatePaymentVoucherModal
                show={showCreateVoucherModal}
                onClose={handleVoucherModalClose}
                onCreated={() => {
                    handleVoucherModalClose();
                    // Refresh vouchers list if we're on that tab
                    if (activeTab === 'vouchers') {
                        loadHbData();
                    }
                }}
                prefilledData={voucherPrefilledData}
            />

            <PaymentVoucherDetailModal
                show={showVoucherDetailModal}
                voucherId={selectedVoucherId}
                onClose={handleVoucherDetailClose}
                onUpdated={loadHbData}
            />
        </DashboardLayout>
    );
};

export default AccountsPayableDashboard;
