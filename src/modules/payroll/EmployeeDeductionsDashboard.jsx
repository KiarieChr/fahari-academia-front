import React, { useState } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
;
import { Download, SlidersHorizontal, Plus, Layers, Wallet, CheckCircle } from 'lucide-react';
import DeductionsSummaryCards from './components/deductions/DeductionsSummaryCards';
import DeductionsAnalytics from './components/deductions/DeductionsAnalytics';
import DeductionsTable from './components/deductions/DeductionsTable';
import AddDeductionModal from './components/deductions/modals/AddDeductionModal';
import AddLoanModal from './components/deductions/modals/AddLoanModal';
import BulkAddDeductionsModal from './components/deductions/modals/BulkAddDeductionsModal';

const EmployeeDeductionsDashboard = () => {
    // Modal States
    const [isAddDeductionOpen, setIsAddDeductionOpen] = useState(false);
    const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);

    // Mock Workflow State
    const [workflowStatus, setWorkflowStatus] = useState('Draft'); // Draft, Pending, Approved, Locked

    return (
        <DashboardLayout title="Employee Deductions">
            

            <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-20 custom-scrollbar relative space-y-8">

                {/* HERO SECTION With Stats */}
                <div>
                    {/* Header Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Deductions Overview</h2>
                            <p className="text-gray-500 mt-1">Manage statutory, voluntary, and loan deductions</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all shadow-sm hover:shadow">
                                <SlidersHorizontal size={16} /> Configuration
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-all shadow-sm hover:shadow">
                                <Download size={16} /> Export Reports
                            </button>
                        </div>
                    </div>

                    <DeductionsSummaryCards />
                </div>

                {/* STICKY CONTROL CENTER */}
                <div className="sticky top-0 z-20 -mx-1 px-1 py-4 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
                    <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-lg shadow-gray-200/50 flex flex-col lg:flex-row justify-between items-center gap-4">

                        {/* Workflow Status */}
                        <div className="flex items-center gap-3 pl-2 w-full lg:w-auto">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${workflowStatus === 'Draft' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                workflowStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-green-50 text-green-700 border-green-100'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${workflowStatus === 'Draft' ? 'bg-slate-500' :
                                    workflowStatus === 'Pending' ? 'bg-amber-500' :
                                        'bg-green-500'
                                    } animate-pulse`} />
                                Status: {workflowStatus}
                            </div>

                            {workflowStatus === 'Draft' && (
                                <button
                                    onClick={() => setWorkflowStatus('Pending')}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Submit for Approval
                                </button>
                            )}
                            {workflowStatus === 'Pending' && (
                                <button
                                    onClick={() => setWorkflowStatus('Approved')}
                                    className="flex items-center gap-1.5 text-xs font-bold text-black bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg shadow-sm shadow-green-200 transition-all"
                                >
                                    <CheckCircle size={14} /> Approve Deductions
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar pr-2">
                            <button
                                onClick={() => setIsAddLoanOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-black rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 hover:-translate-y-0.5 whitespace-nowrap"
                                disabled={workflowStatus === 'Locked'}
                            >
                                <Wallet size={16} /> New Loan
                            </button>

                            <button
                                onClick={() => setIsAddDeductionOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black border border-gray-200 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5 whitespace-nowrap"
                                disabled={workflowStatus === 'Locked'}
                            >
                                <Plus size={16} /> Add Deduction
                            </button>

                            <div className="h-6 w-px bg-gray-200 mx-2"></div>

                            <button
                                onClick={() => setIsBulkAddOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-black hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                                disabled={workflowStatus === 'Locked'}
                            >
                                <Layers size={16} /> Bulk Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Analytics Section */}
                <DeductionsAnalytics />

                {/* 3. Detailed Table */}
                <div className="pb-8">
                    <DeductionsTable />
                </div>

            </div>

            {/* MODALS */}
            <AddDeductionModal isOpen={isAddDeductionOpen} onClose={() => setIsAddDeductionOpen(false)} />
            <AddLoanModal isOpen={isAddLoanOpen} onClose={() => setIsAddLoanOpen(false)} />
            <BulkAddDeductionsModal isOpen={isBulkAddOpen} onClose={() => setIsBulkAddOpen(false)} />

        </DashboardLayout>
    );
};

export default EmployeeDeductionsDashboard;

