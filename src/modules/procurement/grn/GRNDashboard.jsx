import React, { useState, useEffect } from 'react';
import { Package, ClipboardCheck, AlertTriangle, Truck } from 'lucide-react';
import { procurementService } from "../../../services/procurementService";
import GRNList from './GRNList';
import CreateGRN from './CreateGRN';
import { toast } from 'react-toastify';
import './GRN.css';

const GRNDashboard = () => {
    const [view, setView] = useState('list'); // list, create, details
    const [stats, setStats] = useState({
        total: 0,
        pendingInspection: 0,
        posted: 0,
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedGRN, setSelectedGRN] = useState(null);

    useEffect(() => {
        loadStats();
    }, [view]); // Reload stats when view changes (e.g. after creation)

    const loadStats = async () => {
        try {
            const res = await procurementService.getGRNs();
            setStats(res.stats);
        } catch (error) {
            console.error("Failed to load GRN stats", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Goods Received Notes (GRN)</h1>
                    <p className="text-gray-500">Manage receipts, inspections, and inventory updates</p>
                </div>
                {view !== 'list' && (
                    <button
                        onClick={() => setView('list')}
                        className="btn btn-outline-secondary px-4 py-2"
                    >
                        Back to List
                    </button>
                )}
            </div>

            {/* KPI Cards */}
            {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Receipts"
                        value={stats.total}
                        icon={Truck}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Pending Inspection"
                        value={stats.pendingInspection}
                        icon={ClipboardCheck}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="Posted to Inventory"
                        value={stats.posted}
                        icon={Package}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Total Value (KSh)"
                        value={stats.totalValue?.toLocaleString()}
                        icon={AlertTriangle}
                        color="bg-indigo-500"
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-[400px]">
                {view === 'list' && (
                    <GRNList
                        onView={(grn) => { setSelectedGRN(grn); setView('details'); }}
                        onCreate={() => setView('create')}
                    />
                )}

                {view === 'create' && (
                    <CreateGRN
                        onCancel={() => setView('list')}
                        onSuccess={() => {
                            toast.success("GRN Created Successfully!");
                            setView('list');
                        }}
                    />
                )}

                {view === 'details' && selectedGRN && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">GRN Details: {selectedGRN.id}</h2>
                                <p className="text-gray-500">PO Ref: {selectedGRN.poId} | Supplier: {selectedGRN.supplier}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                {selectedGRN.status}
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Items Received</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3">Item</th>
                                        <th className="p-3">Qty Received</th>
                                        <th className="p-3">Qty Rejected</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedGRN.items.map((item, idx) => (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{item.name}</td>
                                            <td className="p-3">{item.quantityReceived}</td>
                                            <td className="p-3 text-red-600">{item.quantityRejected > 0 ? item.quantityRejected : '-'}</td>
                                            <td className="p-3 text-green-600">{item.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                            <p><strong>Received By:</strong> {selectedGRN.receivedBy}</p>
                            <p><strong>Date:</strong> {selectedGRN.dateReceived}</p>
                            <p><strong>Delivery Note:</strong> {selectedGRN.deliveryNote}</p>
                            <p><strong>Total Value:</strong> KSh {selectedGRN.totalValue?.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GRNDashboard;

