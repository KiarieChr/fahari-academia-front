import { Link } from 'react-router-dom';
import { Play, CheckCircle, FileText, Settings, Download, Printer, DollarSign, Coins, Landmark, Scale } from 'lucide-react';

const QuickActionsPanel = () => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-6">Quick Actions</h3>

            <div className="grid grid-cols-4 gap-2 p-2">
                <button className="flex flex-col items-center justify-center p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 group">
                    <Play size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-center">Run Payroll</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 group">
                    <CheckCircle size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-center">Approve</span>
                </button>

                <button className="flex flex-col items-center justify-center p-3 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all active:scale-95 group">
                    <Printer size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-center">Payslips</span>
                </button>

                <Link to="/dashboard/payroll/earnings" className="flex flex-col items-center justify-center p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all active:scale-95 group">
                    <DollarSign size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-center">Earnings</span>
                </Link>

                <Link to="/dashboard/payroll/deductions" className="flex flex-col items-center justify-center p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl hover:bg-red-100 transition-all active:scale-95 group">
                    <Coins size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-center">Deductions</span>
                </Link>

                <Link to="/dashboard/payroll/financial-institutions" className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all active:scale-95 group">
                    <Landmark size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-center">Bank Info</span>
                </Link>

                <Link to="/dashboard/payroll/statutory" className="flex flex-col items-center justify-center p-3 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl hover:bg-purple-100 transition-all active:scale-95 group">
                    <Scale size={18} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-center">Statutory</span>
                </Link>

                {/* NOTE: Linking to the settings route we just set up */}
                <Link to="/dashboard/payroll/settings" className="flex flex-col items-center justify-center p-3 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all active:scale-95 group">
                    <Settings size={18} className="mb-1 group-hover:rotate-90 transition-transform duration-500" />
                    <span className="text-[10px] font-bold text-center">Settings</span>
                </Link>
            </div>

           
        </div>
    );
};

export default QuickActionsPanel;
