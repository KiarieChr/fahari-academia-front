import React from 'react';
import { Check, Clock, FileText, AlertCircle } from 'lucide-react';

const StatusStep = ({ label, status, date, isLast }) => {
    let colorClass, Icon;

    switch (status) {
        case 'completed':
            colorClass = 'bg-green-100 text-green-600 border-green-200';
            Icon = Check;
            break;
        case 'current':
            colorClass = 'bg-blue-100 text-blue-600 border-blue-200';
            Icon = Clock;
            break;
        case 'pending':
            colorClass = 'bg-gray-50 text-gray-400 border-gray-200';
            Icon = FileText;
            break;
        case 'error':
            colorClass = 'bg-red-100 text-red-600 border-red-200';
            Icon = AlertCircle;
            break;
        default:
            colorClass = 'bg-gray-50 text-gray-400 border-gray-200';
            Icon = FileText;
    }

    return (
        <div className="flex-1 relative">
            <div className={`flex flex-col items-center text-center z-10 relative`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${colorClass} mb-3 transition-colors duration-300`}>
                    <Icon size={18} />
                </div>
                <h4 className={`text-sm font-semibold ${status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{label}</h4>
                {date && <p className="text-xs text-gray-500 mt-1">{date}</p>}
            </div>
            {!isLast && (
                <div className="absolute top-5 left-1/2 w-full h-[2px] bg-gray-100 -z-0">
                    <div
                        className={`h-full ${status === 'completed' ? 'bg-green-500' : 'bg-transparent'} transition-all duration-500`}
                        style={{ width: '100%' }}
                    />
                </div>
            )}
        </div>
    );
};

const StatusTracker = () => {
    const steps = [
        { label: 'Draft Created', status: 'completed', date: 'Jan 25, 10:00 AM' },
        { label: 'Pending Approval', status: 'completed', date: 'Jan 26, 02:30 PM' },
        { label: 'Processing', status: 'current', date: 'In Progress' },
        { label: 'Disbursement', status: 'pending', date: 'Scheduled: Jan 28' },
        { label: 'Completed', status: 'pending', date: '-' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Payroll Cycle Status (Jan 2026)</h3>
            <div className="flex justify-between">
                {steps.map((step, index) => (
                    <StatusStep
                        key={index}
                        {...step}
                        isLast={index === steps.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatusTracker;
