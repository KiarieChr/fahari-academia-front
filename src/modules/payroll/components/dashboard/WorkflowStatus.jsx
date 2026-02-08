import React from 'react';
import { Check, Lock, ArrowRight } from 'lucide-react';

const WorkflowStatus = () => {
    const steps = [
        { id: 1, name: 'Draft', status: 'completed', date: 'Jan 25' },
        { id: 2, name: 'Verification', status: 'completed', date: 'Jan 26' },
        { id: 3, name: 'Approval', status: 'current', date: 'Pending' },
        { id: 4, name: 'Disbursement', status: 'upcoming', date: '--' },
        { id: 5, name: 'Locked', status: 'upcoming', date: '--' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">January 2026 Payroll</h3>
                    <p className="text-sm text-gray-500">Processing Cycle: <span className="font-semibold text-blue-600">Active</span></p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold border border-amber-100">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    Action Required
                </div>
            </div>

            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 rounded-full -z-10"></div>
                <div className="absolute top-4 left-0 w-[50%] h-1 bg-blue-600 rounded-full -z-10 transition-all duration-1000"></div>

                <div className="flex justify-between">
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 group cursor-default">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.status === 'completed' ? 'bg-blue-600 border-blue-600 text-white' :
                                    step.status === 'current' ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50' :
                                        'bg-white border-gray-200 text-gray-300'
                                }`}>
                                {step.status === 'completed' ? <Check size={14} strokeWidth={3} /> :
                                    step.name === 'Locked' ? <Lock size={12} /> :
                                        <span className="text-xs font-bold">{step.id}</span>}
                            </div>
                            <div className="text-center">
                                <p className={`text-xs font-bold ${step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-800'}`}>{step.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{step.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkflowStatus;
