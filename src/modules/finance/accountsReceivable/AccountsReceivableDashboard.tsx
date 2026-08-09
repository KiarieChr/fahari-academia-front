import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Printer, Plus } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import CustomerInvoicesTab from './components/CustomerInvoicesTab';
import CreateCustomerInvoiceModal from './components/CreateCustomerInvoiceModal';
import CreateReceiptModal from '../../fees/receipt-book/components/CreateReceiptModal';
import { financeService } from '../../../services/financeService';
import '../accountsPayable/AccountsPayable.css'; // Reusing AP styles for layout

const AccountsReceivableDashboard = () => {
    const [activeTab, setActiveTab] = useState('customer-invoices');
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [selectedYear, setSelectedYear] = useState('2026');

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    // Provide a dummy onCreateRefund for now since it was needed by CustomerInvoicesTab
    const handleCreateRefund = (invoice) => {
        alert('Refund workflow will be implemented soon!');
    };

    const tabs = [
        { id: 'customer-invoices', label: 'Customer Invoices', icon: '💰' },
        { id: 'customer-receipts', label: 'Customer Receipts', icon: '🧾' },
    ];

    return (
        <DashboardLayout title="Accounts Receivable">
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
                        {activeTab === 'customer-invoices' && (
                            <button
                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                onClick={() => setShowInvoiceModal(true)}
                            >
                                <Plus size={14} /> New Invoice
                            </button>
                        )}
                        <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={() => window.print()}>
                                <Printer size={14} /> Print
                            </button>
                        </div>
                    </div>
                </div>

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
                        {activeTab === 'customer-invoices' && (
                            <CustomerInvoicesTab
                                onCreateRefund={handleCreateRefund}
                                onCreateInvoice={() => setShowInvoiceModal(true)}
                                onReceiptInvoice={() => setShowReceiptModal(true)}
                            />
                        )}

                        {activeTab === 'customer-receipts' && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">Customer Receipts</h5>
                                    <p className="text-muted mb-4">View and manage receipts for customer invoices.</p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <button 
                                            className="btn btn-primary d-flex align-items-center gap-2"
                                            onClick={() => setShowReceiptModal(true)}
                                        >
                                            <Plus size={16} />
                                            Issue Customer Receipt
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                            onClick={() => setShowReceiptModal(true)}
                                        >
                                            Import Receipts
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateCustomerInvoiceModal
                show={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                onSave={() => window.location.reload()} // Quick hack to refresh data for now
            />

            <CreateReceiptModal
                show={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                onSave={() => window.location.reload()}
                lastReceiptNumber="RCT-2026-0000"
            />
        </DashboardLayout>
    );
};

export default AccountsReceivableDashboard;
