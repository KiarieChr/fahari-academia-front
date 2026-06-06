import React from 'react';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';

const StatutoryRemittance = () => {
    const remittances = [
        { id: 1, month: 'Jan 2026', type: 'PAYE Returns', amount: 'KES 2,450,000', status: 'Submitted', date: '08 Feb 2026' },
        { id: 2, month: 'Jan 2026', type: 'NSSF Returns', amount: 'KES 480,000', status: 'Submitted', date: '09 Feb 2026' },
        { id: 3, month: 'Jan 2026', type: 'SHA / NHIF', amount: 'KES 320,000', status: 'Submitted', date: '09 Feb 2026' },
        { id: 4, month: 'Jan 2026', type: 'Housing Levy', amount: 'KES 180,000', status: 'Pending', date: '-' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Statutory Returns & Remittances</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                        <tr>
                            <th className="px-4 py-3">Period</th>
                            <th className="px-4 py-3">Return Type</th>
                            <th className="px-4 py-3">Total Liability</th>
                            <th className="px-4 py-3">Submission Status</th>
                            <th className="px-4 py-3 text-right">Files</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {remittances.map((rem) => (
                            <tr key={rem.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{rem.month}</td>
                                <td className="px-4 py-3 text-gray-600">{rem.type}</td>
                                <td className="px-4 py-3 font-mono font-medium text-gray-800">{rem.amount}</td>
                                <td className="px-4 py-3">
                                    <span className={`flex items-center gap-1.5 text-xs font-medium ${rem.status === 'Submitted' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {rem.status === 'Submitted' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        {rem.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold transition-colors inline-flex items-center gap-1">
                                        <Download size={14} /> P10/Zip
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StatutoryRemittance;
