
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, PieChart } from 'lucide-react';
import { procurementReportService } from '../../../services/procurementReportService';
import ReportOverview from './ReportOverview';
import ReportList from './ReportList';

const ProcurementReports = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                const data = await procurementReportService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load report stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Procurement Reports & Analytics</h2>
                    <p className="text-sm text-gray-500">Real-time insights on spend, suppliers, and inventory.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <LayoutDashboard size={16} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'reports'
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FileText size={16} /> All Reports
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'overview' ? (
                loading ? <div className="p-10 text-center text-gray-400">Loading Stats...</div> : <ReportOverview stats={stats} />
            ) : (
                <ReportList />
            )}
        </div>
    );
};

export default ProcurementReports;
