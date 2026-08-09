import React from 'react';
import { Play, CheckCircle, FileText, Download, Settings, Users } from 'lucide-react';

const ActionButton = ({ label, icon: Icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-white text-white hover:shadow-md transition-shadow group cursor-pointer`}
    >
        <div className={`p-3 rounded-full mb-3 ${color} bg-opacity-10 text-${color.replace('text-', '')} group-hover:bg-opacity-20`}>
            <Icon size={24} className={color} />
        </div>
        <span className="text-sm font-semibold text-black">{label}</span>
    </button>
);

const QuickActions = () => {

    const handleAction = (action) => {
        // Placeholder for future modal implementations
        console.log(`Action clicked: ${action}`);
        if (action === 'Run Payroll') {
            // TODO: Open Payroll Modal
            console.log("Open Payroll Modal");
        }
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <ActionButton label="Run Payroll" icon={Play} color="text-blue-600" onClick={() => handleAction('Run Payroll')} />
                <ActionButton label="Approve Batch" icon={CheckCircle} color="text-emerald-600" onClick={() => handleAction('Approve Batch')} />
                <ActionButton label="Payslips" icon={FileText} color="text-indigo-600" onClick={() => handleAction('Payslips')} />
                <ActionButton label="Bank Export" icon={Download} color="text-orange-600" onClick={() => handleAction('Bank Export')} />
                <ActionButton label="Staff Setup" icon={Users} color="text-purple-600" onClick={() => handleAction('Staff Setup')} />
                <ActionButton label="Settings" icon={Settings} color="text-gray-600" onClick={() => handleAction('Settings')} />
            </div>
        </div>
    );
};

export default QuickActions;
