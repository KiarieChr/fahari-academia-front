
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Search, Filter, Plus, FileText, CheckCircle, AlertOctagon } from 'lucide-react';
import { egpService } from '../../../services/egpService';

const TenderManagement = () => {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await egpService.getTenders();
            setTenders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Tender Management">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Tenders / RFQ..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            <Plus size={18} /> New Tender
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4">Ref Number</th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Method</th>
                                <th className="p-4">Estimated Value</th>
                                <th className="p-4">Closing Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Compliance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading...</td></tr>
                            ) : tenders.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No active tenders.</td></tr>
                            ) : (
                                tenders.map(t => (
                                    <tr key={t.id} className="egp-table-row hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                        <td className="p-4 font-mono text-xs text-gray-500">{t.id}</td>
                                        <td className="p-4 font-medium text-gray-800">{t.title}</td>
                                        <td className="p-4 text-gray-600">{t.method}</td>
                                        <td className="p-4 font-medium">KSh {t.value.toLocaleString()}</td>
                                        <td className="p-4 text-gray-500">{t.endDate}</td>
                                        <td className="p-4">
                                            <span className={`egp-status-badge px-2 py-1 rounded-full text-xs ${t.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                t.status === 'Evaluation' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>{t.status}</span>
                                        </td>
                                        <td className="p-4">
                                            {t.complianceStatus === 'Compliant' ? (
                                                <div className="flex items-center text-green-600 text-xs font-bold gap-1 bg-green-50 px-2 py-1 rounded-md w-fit">
                                                    <CheckCircle size={14} /> OK
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-red-600 text-xs font-bold gap-1 bg-red-50 px-2 py-1 rounded-md w-fit" title={t.justification}>
                                                    <AlertOctagon size={14} /> Flagged
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TenderManagement;
