import React from 'react';
import { Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const RemittanceTracking = () => {
    const transactions = [
        { id: 'TXN-001', date: '28 Feb 2026', institution: 'KCB Bank', type: 'Salary Disbursement', amount: 'KES 8,200,500', status: 'Completed', ref: 'KCB-REF-9988' },
        { id: 'TXN-002', date: '28 Feb 2026', institution: 'KRA (PAYE)', type: 'Statutory Remittance', amount: 'KES 2,400,000', status: 'Completed', ref: 'KRA-PRN-1122' },
        { id: 'TXN-003', date: '28 Feb 2026', institution: 'Stima Sacco', type: 'Deduction Remittance', amount: 'KES 450,000', status: 'Processing', ref: 'PENDING' },
        { id: 'TXN-004', date: '28 Feb 2026', institution: 'Jubilee Ins', type: 'Insurance Premium', amount: 'KES 120,000', status: 'Failed', ref: 'ERR-505' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Remittances & Payments</h3>
            <div className="space-y-4">
                {transactions.map((tx) => (
                    <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/60 hover:border-blue-200 transition-all">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg mt-1 ${tx.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                    tx.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                                        'bg-red-100 text-red-600'
                                }`}>
                                {tx.status === 'Completed' ? <CheckCircle size={18} /> :
                                    tx.status === 'Processing' ? <Clock size={18} /> :
                                        <AlertTriangle size={18} />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{tx.institution}</h4>
                                <p className="text-xs text-gray-500">{tx.type} • {tx.date}</p>
                                <p className="text-xs font-mono text-gray-400 mt-1">Ref: {tx.ref}</p>
                            </div>
                        </div>
                        <div className="text-right mt-2 sm:mt-0">
                            <h4 className="font-bold text-gray-900">{tx.amount}</h4>
                            <button className="text-xs text-blue-600 font-medium hover:underline flex items-center justify-end gap-1 mt-1">
                                <Download size={12} /> Receipt
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RemittanceTracking;
