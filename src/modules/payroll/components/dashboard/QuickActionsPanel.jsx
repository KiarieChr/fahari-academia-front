import { Link } from 'react-router-dom';
import { Play, CheckCircle, FileText, Settings, Download, Printer, DollarSign, Coins, Landmark, Scale } from 'lucide-react';

const QuickActionsPanel = () => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-blue-600 text-red rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 group">
                    <Play size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Run Payroll</span>
                </button>

                <button className="flex flex-col items-center justify-center p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 group">
                    <CheckCircle size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Approve</span>
                </button>

                <button className="flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all active:scale-95 group">
                    <Printer size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Payslips</span>
                </button>

                <Link to="/dashboard/payroll/earnings" className="flex flex-col items-center justify-center p-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all active:scale-95 group">
                    <DollarSign size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Earnings</span>
                </Link>

                <Link to="/dashboard/payroll/deductions" className="flex flex-col items-center justify-center p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl hover:bg-red-100 transition-all active:scale-95 group">
                    <Coins size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Deductions</span>
                </Link>

                <Link to="/dashboard/payroll/financial-institutions" className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all active:scale-95 group">
                    <Landmark size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Bank Info</span>
                </Link>

                <Link to="/dashboard/payroll/statutory" className="flex flex-col items-center justify-center p-4 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl hover:bg-purple-100 transition-all active:scale-95 group">
                    <Scale size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Statutory</span>
                </Link>

                {/* NOTE: Linking to the settings route we just set up */}
                <Link to="/dashboard/payroll/settings" className="flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all active:scale-95 group">
                    <Settings size={24} className="mb-2 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-xs font-bold">Settings</span>
                </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                    <Download size={14} /> Download Reports
                </button>
            </div>
        </div>
    );
};

export default QuickActionsPanel;
