import React, { useState } from 'react';
import { Eye, Printer } from 'lucide-react';
import PayrollRunDetailsModal from './modals/PayrollRunDetailsModal';

const RecentRunsTable = () => {
    const [selectedRun, setSelectedRun] = useState(null);

    const runs = [
        { id: 1, period: 'Dec 2025', employees: 138, grossPay: 'KES 4.1M', netPay: 'KES 3.0M', status: 'Paid' },
        { id: 2, period: 'Nov 2025', employees: 135, grossPay: 'KES 4.0M', netPay: 'KES 2.9M', status: 'Paid' },
        { id: 3, period: 'Oct 2025', employees: 132, grossPay: 'KES 3.9M', netPay: 'KES 2.8M', status: 'Paid' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Payroll Runs</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Period</th>
                            <th className="px-4 py-3">Employees</th>
                            <th className="px-4 py-3">Gross Pay</th>
                            <th className="px-4 py-3">Net Pay</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {runs.map((run) => (
                            <tr key={run.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-800">{run.period}</td>
                                <td className="px-4 py-3 text-gray-600">{run.employees}</td>
                                <td className="px-4 py-3 text-gray-600">{run.grossPay}</td>
                                <td className="px-4 py-3 text-gray-600">{run.netPay}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        {run.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedRun(run)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-50" title="Print Summary">
                                            <Printer size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            <PayrollRunDetailsModal run={selectedRun} onClose={() => setSelectedRun(null)} />
        </div>
    );
};

export default RecentRunsTable;
