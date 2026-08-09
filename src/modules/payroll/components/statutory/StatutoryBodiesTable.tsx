import React, { useState } from 'react';
import { Settings, ShieldCheck, AlertCircle } from 'lucide-react';
import StatutoryConfigModal from './modals/StatutoryConfigModal';

const StatutoryBodiesTable = () => {
    const [selectedBody, setSelectedBody] = useState(null);

    const bodies = [
        { id: 1, name: 'Kenya Revenue Authority (PAYE)', type: 'Tax', ref: 'P0511223344', status: 'Active', lastUpdate: 'Jan 2026', deadline: '9th of Month', calcBase: 'Taxable Income' },
        { id: 2, name: 'NSSF (Social Security)', type: 'Pension', ref: 'NSSF-SMB-99', status: 'Active', lastUpdate: 'Feb 2025', deadline: '15th of Month', calcBase: 'Gross Pay' },
        { id: 3, name: 'NHIF / SHA (Health)', type: 'Insurance', ref: 'NHIF-001-Code', status: 'Active', lastUpdate: 'Oct 2024', deadline: '9th of Month', calcBase: 'Gross Pay' },
        { id: 4, name: 'Affordable Housing Levy', type: 'Levy', ref: 'KRA-AHL', status: 'Active', lastUpdate: 'Mar 2024', deadline: '9th of Month', calcBase: 'Gross Pay' },
        { id: 5, name: 'NITA (Industrial Training)', type: 'Levy', ref: 'NITA-REG-88', status: 'Active', lastUpdate: 'Jan 2024', deadline: 'Annually', calcBase: 'Fixed Amount' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Statutory Institutions Registry</h3>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ShieldCheck size={14} /> 5 Active
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Institution Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Reference No.</th>
                            <th className="px-6 py-4">Last Update</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Config</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bodies.map((body) => (
                            <tr key={body.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{body.name}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                                        {body.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-600">{body.ref}</td>
                                <td className="px-6 py-4 text-gray-500">{body.lastUpdate}</td>
                                <td className="px-6 py-4">
                                    <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                                        {body.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedBody(body)}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                    >
                                        <Settings size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Config Modal */}
            <StatutoryConfigModal body={selectedBody} onClose={() => setSelectedBody(null)} />
        </div>
    );
};

export default StatutoryBodiesTable;
