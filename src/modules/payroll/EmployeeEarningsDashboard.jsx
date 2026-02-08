import React, { useState } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
;
import { Download, Plus, Layers, SlidersHorizontal, CheckCircle, FileUp, Sparkles } from 'lucide-react';
import EarningsSummaryCards from './components/earnings/EarningsSummaryCards';
import EarningsAnalytics from './components/earnings/EarningsAnalytics';
import EarningsTable from './components/earnings/EarningsTable';
import AddOneTimeEarningModal from './components/earnings/modals/AddOneTimeEarningModal';
import AddEarningModal from './components/earnings/modals/AddEarningModal';
import BulkAddEarningsModal from './components/earnings/modals/BulkAddEarningsModal';

const EmployeeEarningsDashboard = () => {
    // State for Modals
    const [isAddOneTimeOpen, setIsAddOneTimeOpen] = useState(false);
    const [isAddEarningOpen, setIsAddEarningOpen] = useState(false);
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);

    // Mock Workflow State
    const [workflowStatus, setWorkflowStatus] = useState('Draft'); // Draft, Pending, Approved, Locked

    return (
        <DashboardLayout title="Employee Earnings">
            

            <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-20 custom-scrollbar relative space-y-8">

                {/* HERO SECTION With Stats */}
                <div>
                    {/* Header Actions - Integrated with Title for cleaner look */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Earnings Overview</h2>
                            <p className="text-gray-500 mt-1">Manage employee compensation, allowances & bonuses</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                                <FileUp size={16} /> Import
                            </button>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                                <Download size={16} /> Export Report
                            </button>
                        </div>
                    </div>

                    <EarningsSummaryCards />
                </div>

                {/* STICKY CONTROL CENTER */}
                <div className="sticky top-0 z-20 -mx-1 px-1 py-4 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg shadow-gray-200/50 flex flex-col lg:flex-row justify-between items-center gap-4">

                        {/* Status Indicator */}
                        <div className="flex items-center gap-3 pl-2 w-full lg:w-auto">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${workflowStatus === 'Draft' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                workflowStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-green-50 text-green-700 border-green-100'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${workflowStatus === 'Draft' ? 'bg-blue-500' :
                                    workflowStatus === 'Pending' ? 'bg-amber-500' :
                                        'bg-green-500'
                                    } animate-pulse`} />
                                Status: {workflowStatus}
                            </div>

                            {workflowStatus === 'Draft' && (
                                <button
                                    onClick={() => setWorkflowStatus('Pending')}
                                    className="btn btn-outline-primary btn-sm"
                                >
                                    Submit for Approval
                                </button>
                            )}
                            {workflowStatus === 'Pending' && (
                                <button
                                    onClick={() => setWorkflowStatus('Approved')}
                                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                >
                                    <CheckCircle size={14} /> Approve All
                                </button>
                            )}
                        </div>

                        {/* Primary Actions */}
                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar pr-2">
                            <button
                                onClick={() => setIsAddOneTimeOpen(true)}
                                className="btn btn-warning d-flex align-items-center gap-2 text-white"
                                disabled={workflowStatus === 'Locked'}
                            >
                                <Sparkles size={16} />
                                One-Time Earning
                            </button>

                            <div className="h-6 w-px bg-gray-200 mx-2"></div>

                            <button
                                onClick={() => setIsAddEarningOpen(true)}
                                className="btn btn-primary d-flex align-items-center gap-2"
                                disabled={workflowStatus === 'Locked'}
                            >
                                <Plus size={16} /> Add Recurring
                            </button>

                            <button
                                onClick={() => setIsBulkAddOpen(true)}
                                className="btn btn-outline-primary d-flex align-items-center gap-2"
                                disabled={workflowStatus === 'Locked'}
                            >
                                <Layers size={16} /> Bulk Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Analytics Section */}
                <EarningsAnalytics />

                {/* 3. Detailed Table */}
                <div className="pb-8">
                    <EarningsTable />
                </div>

            </div>

            {/* MODALS */}
            <AddOneTimeEarningModal isOpen={isAddOneTimeOpen} onClose={() => setIsAddOneTimeOpen(false)} />
            <AddEarningModal isOpen={isAddEarningOpen} onClose={() => setIsAddEarningOpen(false)} />
            <BulkAddEarningsModal isOpen={isBulkAddOpen} onClose={() => setIsBulkAddOpen(false)} />

        </DashboardLayout>
    );
};

export default EmployeeEarningsDashboard;

