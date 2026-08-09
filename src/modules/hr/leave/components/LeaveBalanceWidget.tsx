import React from 'react';
import { Info } from 'lucide-react';

const LeaveBalanceWidget = ({ balances }) => {
    return (
        <div className="leave-card p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">My Leave Balance</h3>
                <Info size={18} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>

            <div className="space-y-6">
                {balances.map((balance, index) => {
                    const total = parseFloat(balance.closing_balance) || balance.total || 0;
                    const used = parseFloat(balance.taken_days) || balance.used || 0;
                    const typeName = balance.leave_type_name || balance.type || 'Unknown';
                    const color = balance.color || 'bg-blue-500';
                    
                    const percentage = total > 0 ? (used / total) * 100 : 0;
                    const remaining = total - used;

                    return (
                        <div key={index} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-gray-800 text-sm">{typeName}</span>
                                <span className="text-xs font-medium text-gray-500">{used} / {total} days</span>
                            </div>

                            <div className="balance-progress-bar mb-2">
                                <div
                                    className={`balance-progress-fill ${color}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Used: <span className="text-gray-700 font-medium">{used} days</span></span>
                                <span>Remaining: <span className="text-gray-700 font-medium">{remaining} days</span></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaveBalanceWidget;

