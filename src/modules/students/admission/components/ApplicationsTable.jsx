import React, { useState, useEffect } from 'react';
import { Eye, Check, X, MoreVertical, Edit, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

import ApplicationDetailsModal from './ApplicationDetailsModal';

import { studentManagementService } from '../../../../services/studentManagementService';

const ApplicationsTable = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await studentManagementService.getApplications();
            setApps(data.results || data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (id, action) => {
        try {
            if (action === 'Admit') {
                const toastId = toast.loading('Admitting student...');
                await studentManagementService.admitApplicant(id, {});
                toast.success('Student Admitted Successfully', { id: toastId });
                fetchApplications(); // Refresh list
            } else if (action === 'Reject') {
                await studentManagementService.updateApplication(id, { application_status: 'rejected' });
                toast.success('Application Rejected');
                fetchApplications();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Action failed');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header / Filters */}
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search applicants..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Pending', 'Admitted', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === status ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {status}
                        </button>
                    ))}
                    <button className="p-2 border rounded-lg text-gray-500 hover:bg-gray-50">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8">Loading applications...</td></tr>
                        ) : apps.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-8">No applications found</td></tr>
                        ) : apps.filter(a => filter === 'All' || a.application_status === filter.toLowerCase()).map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{app.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{app.first_name} {app.last_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.grade_name || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        app.application_status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {app.application_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setSelectedApp(app)} className="group relative p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                                            <Eye size={18} />
                                        </button>
                                        {app.application_status === 'pending' && (
                                            <>
                                                <button onClick={() => handleAction(app.id, 'Admit')} className="group relative p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50 transition-colors">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => handleAction(app.id, 'Reject')} className="group relative p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            <ApplicationDetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} />
        </div>
    );
};

export default ApplicationsTable;

