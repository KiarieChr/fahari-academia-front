
import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, AlertTriangle, Gavel } from 'lucide-react';

import { egpService } from '../../../services/egpService';
import TenderManagement from './components/TenderManagement';
import ComplianceLog from './components/ComplianceLog';
import './components/egp.css';

const EGPDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});

    useEffect(() => {
        egpService.getDashboardStats().then(setStats);
    }, []);

    const KPICard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    <p className="text-gray-500 text-sm mt-1">{title}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">E-Government Procurement (E-GP)</h2>
                    <p className="text-sm text-gray-500">Compliance monitoring and tender management.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                    <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Overview</button>
                    <button onClick={() => setActiveTab('tenders')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'tenders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Tender Management</button>
                    <button onClick={() => setActiveTab('compliance')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'compliance' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Audit Logs</button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KPICard title="Compliance Rate" value={`${stats.complianceRate}%`} icon={ShieldCheck} color="bg-green-100 text-green-600" />
                    <KPICard title="Active Tenders" value={stats.activeTenders} icon={Gavel} color="bg-blue-100 text-blue-600" />
                    <KPICard title="Total Procurements" value={stats.totalProcurements} icon={FileText} color="bg-purple-100 text-purple-600" />
                    <KPICard title="Flagged Items" value={stats.flaggedTransactions} icon={AlertTriangle} color="bg-red-100 text-red-600" />

                    <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-4">Method Distribution</h4>
                        <div className="space-y-3">
                            {stats.methodDistribution?.map(m => (
                                <div key={m.name} className="flex items-center">
                                    <span className="w-32 text-sm text-gray-600">{m.name}</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${m.name === 'Direct' ? 'bg-orange-500' : 'bg-blue-500'}`}
                                            style={{ width: `${(m.value / stats.totalProcurements) * 100}%` }}
                                        />
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-800">{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tenders' && <TenderManagement />}
            {activeTab === 'compliance' && <ComplianceLog />}
        </div>
    );
};

export default EGPDashboard;
