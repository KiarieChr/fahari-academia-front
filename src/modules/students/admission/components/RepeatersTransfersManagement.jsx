import React, { useState } from 'react';
import { Repeat, ArrowRight, ArrowLeft } from 'lucide-react';

const RepeatersTransfersManagement = () => {
    const [subTab, setSubTab] = useState('repeaters');

    const REPEATERS = [
        { name: 'John Doe', prevClass: 'Grade 4', currentClass: 'Grade 4', reason: 'Medical Issues', year: '2025' },
    ];

    const TRANSFERS_IN = [
        { name: 'Mary Jane', from: 'Hillside Academy', class: 'Grade 5', date: '2025-01-10', status: 'Approved' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setSubTab('repeaters')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${subTab === 'repeaters' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Repeat size={18} /> Repeaters
                </button>
                <button
                    onClick={() => setSubTab('transfers')}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${subTab === 'transfers' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <ArrowLeft size={18} /> Transfers
                </button>
            </div>

            {subTab === 'repeaters' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repeating Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {REPEATERS.map((r, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.currentClass}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.reason}</td>
                                    <td className="px-6 py-4 text-gray-500">{r.year}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 font-medium hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'transfers' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">Incoming Transfers</div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous School</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {TRANSFERS_IN.map((t, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{t.from}</td>
                                    <td className="px-6 py-4 text-gray-500">{t.class}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RepeatersTransfersManagement;
