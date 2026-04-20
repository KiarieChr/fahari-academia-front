
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Archive, History, BarChart2, Upload, Download, ArrowUpCircle, ArrowDownCircle, RefreshCw, Layers, PlusCircle } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import DashboardLayout from '../../dashboard/DashboardLayout';
import SupplyDashboard from './SupplyDashboard';
import StockRegister from './StockRegister';
import StockAdjustments from './StockAdjustments';
import ItemMaster from './ItemMaster';
import CreateSupplyIssue from './CreateSupplyIssue';
import { toast } from 'react-toastify';

const OverviewStats = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Total Inventory Value</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        KSh {stats.totalStockValue?.toLocaleString()}
                    </h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <TrendingUp size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Total Items</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalItems}</h3>
                    <p className="text-xs text-gray-400 mt-1">{stats.capitalAssets} Capital Assets</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Package size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Low Stock Items</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.lowStock}</h3>
                    <p className="text-xs text-red-500 mt-1">{stats.outOfStock} Out of Stock</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <AlertTriangle size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Expired / Near Expiry</p>
                    <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.expired}</h3>
                    <p className="text-xs text-orange-500 mt-1">Requires Action</p>
                </div>
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                    <Archive size={24} />
                </div>
            </div>
        </div>
    </div>
);

const movementTypeIcon = (type) => {
    switch (type) {
        case 'RECEIPT': case 'ADJUSTMENT_IN': case 'RETURN':
            return <ArrowUpCircle size={16} className="text-green-500" />;
        case 'ISSUE': case 'ADJUSTMENT_OUT': case 'DISPOSAL':
            return <ArrowDownCircle size={16} className="text-red-500" />;
        default:
            return <RefreshCw size={16} className="text-blue-500" />;
    }
};

const movementTypeBadge = (type) => {
    const styles = {
        'RECEIPT': 'bg-green-100 text-green-700',
        'ISSUE': 'bg-red-100 text-red-700',
        'ADJUSTMENT_IN': 'bg-blue-100 text-blue-700',
        'ADJUSTMENT_OUT': 'bg-orange-100 text-orange-700',
        'RETURN': 'bg-teal-100 text-teal-700',
        'DISPOSAL': 'bg-gray-100 text-gray-700',
        'OPENING': 'bg-purple-100 text-purple-700',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
            {type?.replace('_', ' ')}
        </span>
    );
};

const InventoryDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [categories, setCategories] = useState([]);
    const [recentMovements, setRecentMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Excel upload state
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [itemsRes, rawStats] = await Promise.all([
                inventoryService.getInventoryItems(),
                inventoryService.getStats()
            ]);
            setStats(itemsRes.stats);
            setCategories(rawStats.categories || []);
            setRecentMovements(rawStats.recent_movements || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await inventoryService.downloadTemplate();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'inventory_upload_template.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Template downloaded');
        } catch (error) {
            toast.error('Failed to download template');
        }
    };

    const handleUploadExcel = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadResult(null);
        try {
            const result = await inventoryService.uploadExcel(file);
            setUploadResult(result);
            toast.success(`Upload complete: ${result.created} items created`);
            loadData();
        } catch (error) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: BarChart2 },
        { id: 'register', label: 'Stock Register', icon: Package },
        { id: 'items', label: 'Item Master', icon: Layers },
        { id: 'adjustments', label: 'Stock Adjustments', icon: RefreshCw },
        { id: 'supply', label: 'Supply Issues', icon: History },
        { id: 'create-issue', label: 'New Issue', icon: PlusCircle },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <>
                        <OverviewStats stats={stats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Category Breakdown */}
                            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-800">Stock by Category</h3>
                                </div>
                                <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
                                    {categories.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-4">No categories found</p>
                                    ) : (
                                        categories.map(cat => {
                                            const maxVal = Math.max(...categories.map(c => parseFloat(c.total_value || 0)), 1);
                                            const pct = ((parseFloat(cat.total_value || 0) / maxVal) * 100).toFixed(0);
                                            return (
                                                <div key={cat.id}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-700 font-medium">{cat.name}</span>
                                                        <span className="text-gray-500">{cat.item_count} items</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className="bg-indigo-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        KSh {parseFloat(cat.total_value || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Recent Stock Movements */}
                            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-800">Recent Stock Movements</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                            <tr>
                                                <th className="p-3 text-left">Type</th>
                                                <th className="p-3 text-left">Item</th>
                                                <th className="p-3 text-center">Qty</th>
                                                <th className="p-3 text-left">Reference</th>
                                                <th className="p-3 text-left">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {recentMovements.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="p-6 text-center text-gray-400">
                                                        No stock movements recorded yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentMovements.map(mv => (
                                                    <tr key={mv.id} className="hover:bg-gray-50">
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-2">
                                                                {movementTypeIcon(mv.movement_type)}
                                                                {movementTypeBadge(mv.movement_type)}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 font-medium text-gray-700">{mv.item_name || mv.item}</td>
                                                        <td className="p-3 text-center font-semibold">{mv.quantity}</td>
                                                        <td className="p-3 text-gray-500">{mv.reference_number || '-'}</td>
                                                        <td className="p-3 text-gray-400 text-xs">{mv.created_at?.split('T')[0]}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Excel Upload Section */}
                        <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-semibold text-gray-800 mb-4">Bulk Upload</h3>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                    <Download size={18} /> Download Template
                                </button>

                                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}>
                                    <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Excel'}
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={handleUploadExcel}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>

                            {uploadResult && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border text-sm">
                                    <div className="flex gap-6 mb-2">
                                        <span className="text-green-600 font-medium">Created: {uploadResult.created}</span>
                                        <span className="text-blue-600 font-medium">Updated: {uploadResult.updated}</span>
                                        <span className="text-red-600 font-medium">Errors: {uploadResult.errors?.length || 0}</span>
                                    </div>
                                    {uploadResult.errors?.length > 0 && (
                                        <div className="mt-2 max-h-32 overflow-y-auto">
                                            {uploadResult.errors.map((err, i) => (
                                                <p key={i} className="text-red-500 text-xs">Row {err.row}: {err.error}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'register':
                return <StockRegister />;
            case 'items':
                return <ItemMaster />;
            case 'adjustments':
                return <StockAdjustments />;
            case 'supply':
                return <SupplyDashboard />;
            case 'create-issue':
                return <CreateSupplyIssue onCancel={() => setActiveTab('supply')} onSuccess={() => setActiveTab('supply')} />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout title="Inventory & Stores">
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Internal Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Inventory
                        </h3>
                        <nav className="space-y-1">
                            {sidebarItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={18} className="mr-3" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto bg-gray-50 p-6">
                    {renderContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InventoryDashboard;
