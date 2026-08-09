import React, { useState } from 'react';
import { Network, Plus, Users, ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const ApprovalWorkflow = () => {
    const [workflowEnabled, setWorkflowEnabled] = useState(true);

    const levels = [
        { id: 1, name: 'HR Verification', role: 'HR Manager', color: 'blue' },
        { id: 2, name: 'Finance Review', role: 'Chief Accountant', color: 'indigo' },
        { id: 3, name: 'Final Authorization', role: 'Director', color: 'emerald' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Approval Workflow</h3>
                    <p className="text-sm text-gray-500">Construct the approval chain for payroll processing.</p>
                </div>
                <div className="flex items-center gap-3 p-1.5 bg-gray-100 rounded-lg">
                    <span className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${!workflowEnabled ? 'bg-white shadow text-gray-800' : 'text-gray-500 cursor-pointer'}`} onClick={() => setWorkflowEnabled(false)}>Off</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${workflowEnabled ? 'bg-white shadow text-blue-600' : 'text-gray-500 cursor-pointer'}`} onClick={() => setWorkflowEnabled(true)}>Active</span>
                </div>
            </div>

            {workflowEnabled ? (
                <div className="space-y-8">
                    <div className="relative max-w-2xl mx-auto py-6">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 -z-10"></div>

                        {levels.map((level, index) => (
                            <motion.div
                                key={level.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-6 mb-8 last:mb-0 relative"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${level.color === 'blue' ? 'bg-blue-100 text-blue-600' : level.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 text-xl font-bold`}>
                                    {level.id}
                                </div>
                                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${level.color === 'blue' ? 'bg-blue-500' : level.color === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{level.name}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                                <Users size={12} /> Assigned Role: <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{level.role}</span>
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-xs text-blue-600 font-semibold hover:underline">Configure</button>
                                        </div>
                                    </div>

                                    {/* Action Chips */}
                                    <div className="flex gap-2 mt-4">
                                        <div className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-medium rounded flex items-center gap-1"><Check size={10} /> Can Approve</div>
                                        <div className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-medium rounded flex items-center gap-1">✕ Can Reject</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Connection End Dot */}
                        <div className="absolute left-[30px] bottom-[-10px] w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="flex justify-center border-t border-gray-100 pt-6">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-all shadow hover:shadow-lg active:scale-95">
                            <Plus size={16} />
                            Add Approval Step
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-16 text-center text-gray-500">
                    <Network className="mx-auto mb-4 opacity-20" size={64} />
                    <h4 className="text-xl font-bold text-gray-700">Workflow Disabled</h4>
                    <p className="text-sm mt-2 max-w-sm mx-auto">Payroll processing will not require intermediate approvals. Administrators can process and finalize directly.</p>
                    <button onClick={() => setWorkflowEnabled(true)} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow-sm">Enable Workflow</button>
                </div>
            )}
        </div>
    );
};

export default ApprovalWorkflow;
